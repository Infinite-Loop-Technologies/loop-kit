// crates/loop-runtime/src/lib.rs
//! Loop-Kit Runtime
//!
//! This crate provides the host-side runtime for executing loop-kit WASM components.
//! It implements the WIT interfaces and provides windowing via winit.

pub mod host;

use std::path::Path;
use std::sync::Arc;
use std::time::Instant;

use anyhow::{Context, Result};
use tracing::{debug, error, info};
use wasmtime::component::{Component, Linker, ResourceTable};
use wasmtime::{Config, Engine, Store};
use winit::application::ApplicationHandler;
use winit::dpi::LogicalSize;
use winit::event::{ElementState, WindowEvent};
use winit::event_loop::{ActiveEventLoop, ControlFlow, EventLoop};
use winit::window::{Window, WindowId};

use host::{HostState, WindowConfig};

// Generate bindings from WIT
wasmtime::component::bindgen!({
    world: "app",
    path: "../../wit",
    tracing: true,
    async: false,
    with: {
        "loop:kit/types": host::types,
    },
});

/// Configuration for the runtime
#[derive(Debug, Clone)]
pub struct RuntimeConfig {
    /// Enable debug mode
    pub debug: bool,
    /// Target FPS (0 for unlimited)
    pub target_fps: u32,
}

impl Default for RuntimeConfig {
    fn default() -> Self {
        Self {
            debug: false,
            target_fps: 60,
        }
    }
}

/// The main runtime that executes loop-kit components
pub struct Runtime {
    engine: Engine,
    config: RuntimeConfig,
}

impl Runtime {
    /// Create a new runtime with the given configuration
    pub fn new(config: RuntimeConfig) -> Result<Self> {
        let mut engine_config = Config::new();
        engine_config.wasm_component_model(true);
        engine_config.cranelift_opt_level(if config.debug {
            wasmtime::OptLevel::None
        } else {
            wasmtime::OptLevel::Speed
        });

        let engine = Engine::new(&engine_config)?;

        Ok(Self { engine, config })
    }

    /// Run a component from the given path
    pub fn run(&self, component_path: &Path) -> Result<()> {
        info!("Loading component from: {}", component_path.display());

        let component_bytes = std::fs::read(component_path)
            .with_context(|| format!("Failed to read component: {}", component_path.display()))?;

        let component =
            Component::new(&self.engine, &component_bytes).context("Failed to create component")?;

        // Create the event loop
        let event_loop = EventLoop::new().context("Failed to create event loop")?;
        event_loop.set_control_flow(ControlFlow::Poll);

        // Create the app handler
        let mut app = AppHandler::new(self.engine.clone(), component, self.config.clone())?;

        // Run the event loop
        event_loop.run_app(&mut app).context("Event loop error")?;

        Ok(())
    }
}

/// The winit application handler that bridges the event loop to the WASM component
struct AppHandler {
    engine: Engine,
    component: Component,
    config: RuntimeConfig,

    // Runtime state (initialized when window is created)
    state: Option<AppState>,
}

struct AppState {
    store: Store<HostState>,
    bindings: App,
    window: Arc<Window>,
    surface: softbuffer::Surface<Arc<Window>, Arc<Window>>,
    last_frame: Instant,
}

impl AppHandler {
    fn new(engine: Engine, component: Component, config: RuntimeConfig) -> Result<Self> {
        Ok(Self {
            engine,
            component,
            config,
            state: None,
        })
    }

    fn init_component(&mut self, event_loop: &ActiveEventLoop) -> Result<()> {
        // Create initial window with default config
        let window_attrs = Window::default_attributes()
            .with_title("Loop-Kit App")
            .with_inner_size(LogicalSize::new(800u32, 600u32));

        let window = Arc::new(
            event_loop
                .create_window(window_attrs)
                .context("Failed to create window")?,
        );

        // Create software rendering surface
        let context = softbuffer::Context::new(window.clone())
            .map_err(|e| anyhow::anyhow!("Softbuffer context error: {}", e))?;
        let surface = softbuffer::Surface::new(&context, window.clone())
            .map_err(|e| anyhow::anyhow!("Softbuffer surface error: {}", e))?;

        // Create linker and add host functions
        let mut linker = Linker::new(&self.engine);
        App::add_to_linker(&mut linker, |state: &mut HostState| state)?;

        // Create host state
        let host_state = HostState::new(window.clone());

        // Create store
        let mut store = Store::new(&self.engine, host_state);

        // Instantiate the component
        let bindings = App::instantiate(&mut store, &self.component, &linker)
            .context("Failed to instantiate component")?;

        // Call init
        debug!("Calling component init()");
        bindings.call_init(&mut store)?;

        // Apply any window configuration from init
        let config = store.data().window_config();
        if let Some(cfg) = config {
            window.set_title(&cfg.title);
            let _ = window.request_inner_size(LogicalSize::new(cfg.width, cfg.height));
        }

        self.state = Some(AppState {
            store,
            bindings,
            window,
            surface,
            last_frame: Instant::now(),
        });

        Ok(())
    }

    fn update_and_render(&mut self) -> Result<bool> {
        let state = self.state.as_mut().unwrap();

        // Calculate delta time
        let now = Instant::now();
        let delta = now.duration_since(state.last_frame);
        state.last_frame = now;

        // Update canvas dimensions
        let size = state.window.inner_size();
        state
            .store
            .data_mut()
            .set_canvas_size(size.width, size.height);

        // Call update
        let delta_us = delta.as_micros() as u64;
        state.bindings.call_update(&mut state.store, delta_us)?;

        // Call render
        state.bindings.call_render(&mut state.store)?;

        // Present the frame
        let (width, height) = (size.width as usize, size.height as usize);
        if width > 0 && height > 0 {
            state
                .surface
                .resize(
                    std::num::NonZeroU32::new(size.width).unwrap(),
                    std::num::NonZeroU32::new(size.height).unwrap(),
                )
                .map_err(|e| anyhow::anyhow!("Resize error: {}", e))?;

            let mut buffer = state
                .surface
                .buffer_mut()
                .map_err(|e| anyhow::anyhow!("Buffer error: {}", e))?;

            // Copy from canvas to surface
            let canvas_buffer = state.store.data().canvas_buffer();
            let len = buffer.len().min(canvas_buffer.len());
            buffer[..len].copy_from_slice(&canvas_buffer[..len]);

            buffer
                .present()
                .map_err(|e| anyhow::anyhow!("Present error: {}", e))?;
        }

        // Check if we should exit
        Ok(state.store.data().should_exit())
    }
}

impl ApplicationHandler for AppHandler {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        if self.state.is_none() {
            if let Err(e) = self.init_component(event_loop) {
                error!("Failed to initialize component: {}", e);
                event_loop.exit();
            }
        }
    }

    fn window_event(
        &mut self,
        event_loop: &ActiveEventLoop,
        _window_id: WindowId,
        event: WindowEvent,
    ) {
        let Some(state) = self.state.as_mut() else {
            return;
        };

        // Convert winit event to WIT event
        let wit_event = match &event {
            WindowEvent::CloseRequested => Some(host::types::Event::CloseRequested),

            WindowEvent::Resized(size) => Some(host::types::Event::Resized(host::types::Size {
                width: size.width,
                height: size.height,
            })),

            WindowEvent::Focused(focused) => Some(host::types::Event::Focused(*focused)),

            WindowEvent::KeyboardInput { event, .. } => {
                if let winit::keyboard::PhysicalKey::Code(code) = event.physical_key {
                    let key = convert_key_code(code);
                    match event.state {
                        ElementState::Pressed => Some(host::types::Event::KeyPressed(key)),
                        ElementState::Released => Some(host::types::Event::KeyReleased(key)),
                    }
                } else {
                    None
                }
            }

            WindowEvent::CursorMoved { position, .. } => {
                state
                    .store
                    .data_mut()
                    .set_cursor_position(Some((position.x, position.y)));
                Some(host::types::Event::MouseMoved(host::types::Point {
                    x: position.x,
                    y: position.y,
                }))
            }

            WindowEvent::CursorEntered { .. } => Some(host::types::Event::MouseEntered),

            WindowEvent::CursorLeft { .. } => {
                state.store.data_mut().set_cursor_position(None);
                Some(host::types::Event::MouseLeft)
            }

            WindowEvent::MouseInput {
                state: btn_state,
                button,
                ..
            } => {
                let btn = match button {
                    winit::event::MouseButton::Left => host::types::MouseButton::Left,
                    winit::event::MouseButton::Right => host::types::MouseButton::Right,
                    winit::event::MouseButton::Middle => host::types::MouseButton::Middle,
                    winit::event::MouseButton::Back => host::types::MouseButton::Back,
                    winit::event::MouseButton::Forward => host::types::MouseButton::Forward,
                    winit::event::MouseButton::Other(_) => return,
                };
                match btn_state {
                    ElementState::Pressed => Some(host::types::Event::MousePressed(btn)),
                    ElementState::Released => Some(host::types::Event::MouseReleased(btn)),
                }
            }

            WindowEvent::MouseWheel { delta, .. } => {
                let (dx, dy) = match delta {
                    winit::event::MouseScrollDelta::LineDelta(x, y) => (*x as f64, *y as f64),
                    winit::event::MouseScrollDelta::PixelDelta(pos) => (pos.x, pos.y),
                };
                Some(host::types::Event::MouseScroll((dx, dy)))
            }

            WindowEvent::RedrawRequested => {
                match self.update_and_render() {
                    Ok(should_exit) => {
                        if should_exit {
                            event_loop.exit();
                        }
                    }
                    Err(e) => {
                        error!("Update/render error: {}", e);
                        event_loop.exit();
                    }
                }
                // Request next frame
                state.window.request_redraw();
                return;
            }

            _ => None,
        };

        // Send event to component
        if let Some(evt) = wit_event {
            match state.bindings.call_on_event(&mut state.store, &evt) {
                Ok(result) => {
                    if matches!(result, host::types::EventResult::Exit) {
                        event_loop.exit();
                    }
                }
                Err(e) => {
                    error!("Event handler error: {}", e);
                }
            }
        }
    }

    fn about_to_wait(&mut self, _event_loop: &ActiveEventLoop) {
        if let Some(state) = &self.state {
            state.window.request_redraw();
        }
    }
}

/// Convert winit key code to WIT key code
fn convert_key_code(code: winit::keyboard::KeyCode) -> host::types::KeyCode {
    use host::types::KeyCode as W;
    use winit::keyboard::KeyCode as K;

    match code {
        K::KeyA => W::A,
        K::KeyB => W::B,
        K::KeyC => W::C,
        K::KeyD => W::D,
        K::KeyE => W::E,
        K::KeyF => W::F,
        K::KeyG => W::G,
        K::KeyH => W::H,
        K::KeyI => W::I,
        K::KeyJ => W::J,
        K::KeyK => W::K,
        K::KeyL => W::L,
        K::KeyM => W::M,
        K::KeyN => W::N,
        K::KeyO => W::O,
        K::KeyP => W::P,
        K::KeyQ => W::Q,
        K::KeyR => W::R,
        K::KeyS => W::S,
        K::KeyT => W::T,
        K::KeyU => W::U,
        K::KeyV => W::V,
        K::KeyW => W::W,
        K::KeyX => W::X,
        K::KeyY => W::Y,
        K::KeyZ => W::Z,
        K::Digit0 => W::Num0,
        K::Digit1 => W::Num1,
        K::Digit2 => W::Num2,
        K::Digit3 => W::Num3,
        K::Digit4 => W::Num4,
        K::Digit5 => W::Num5,
        K::Digit6 => W::Num6,
        K::Digit7 => W::Num7,
        K::Digit8 => W::Num8,
        K::Digit9 => W::Num9,
        K::F1 => W::F1,
        K::F2 => W::F2,
        K::F3 => W::F3,
        K::F4 => W::F4,
        K::F5 => W::F5,
        K::F6 => W::F6,
        K::F7 => W::F7,
        K::F8 => W::F8,
        K::F9 => W::F9,
        K::F10 => W::F10,
        K::F11 => W::F11,
        K::F12 => W::F12,
        K::Escape => W::Escape,
        K::Enter => W::Enter,
        K::Space => W::Space,
        K::Tab => W::Tab,
        K::Backspace => W::Backspace,
        K::Delete => W::Delete,
        K::ArrowLeft => W::Left,
        K::ArrowRight => W::Right,
        K::ArrowUp => W::Up,
        K::ArrowDown => W::Down,
        K::Home => W::Home,
        K::End => W::End,
        K::PageUp => W::PageUp,
        K::PageDown => W::PageDown,
        K::ShiftLeft | K::ShiftRight => W::Shift,
        K::ControlLeft | K::ControlRight => W::Ctrl,
        K::AltLeft | K::AltRight => W::Alt,
        K::SuperLeft | K::SuperRight => W::Super,
        _ => W::Unknown,
    }
}
