use anyhow::{Context, Result};
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::time::Instant;
use wasmtime::component::*;
use wasmtime::*;
use wasmtime_wasi::{WasiCtx, WasiCtxBuilder, WasiView};
use winit::{
    event::*,
    event_loop::{ControlFlow, EventLoop},
    window::{Window, WindowBuilder},
};

pub struct LoopHost {
    engine: Engine,
    hot_reload: bool,
}

struct HostState {
    wasi: WasiCtx,
    window_state: Arc<Mutex<WindowState>>,
    input_state: Arc<Mutex<InputState>>,
}

#[derive(Default)]
struct WindowState {
    width: u32,
    height: u32,
    should_close: bool,
    clear_color: [f32; 4],
}

#[derive(Default)]
struct InputState {
    keys_pressed: std::collections::HashSet<String>,
    keys_down: std::collections::HashSet<String>,
    mouse_x: f64,
    mouse_y: f64,
}

impl WasiView for HostState {
    fn ctx(&mut self) -> &mut WasiCtx {
        &mut self.wasi
    }
    fn table(&mut self) -> &mut ResourceTable {
        self.ctx().table()
    }
}

impl LoopHost {
    pub fn new(hot_reload: bool) -> Result<Self> {
        let mut config = Config::new();
        config.wasm_component_model(true);
        config.async_support(true);

        let engine = Engine::new(&config)?;

        Ok(Self { engine, hot_reload })
    }

    pub async fn run(&mut self, component_path: &Path) -> Result<()> {
        let event_loop = EventLoop::new()?;
        let window = WindowBuilder::new()
            .with_title("Loop-Kit")
            .with_inner_size(winit::dpi::LogicalSize::new(800, 600))
            .build(&event_loop)?;

        let window_state = Arc::new(Mutex::new(WindowState {
            width: 800,
            height: 600,
            should_close: false,
            clear_color: [0.1, 0.1, 0.15, 1.0],
        }));

        let input_state = Arc::new(Mutex::new(InputState::default()));

        // Load component
        let component_bytes = std::fs::read(component_path)?;
        let component = Component::from_binary(&self.engine, &component_bytes)?;

        // Create linker and add host functions
        let mut linker = Linker::new(&self.engine);
        wasmtime_wasi::add_to_linker_async(&mut linker)?;

        // Add custom host functions
        self.add_host_functions(&mut linker, window_state.clone(), input_state.clone())?;

        // Create store
        let wasi = WasiCtxBuilder::new().build();
        let state = HostState {
            wasi,
            window_state: window_state.clone(),
            input_state: input_state.clone(),
        };

        let mut store = Store::new(&self.engine, state);

        // Instantiate component
        let instance = linker.instantiate_async(&mut store, &component).await?;

        // Get exports
        let init = instance.get_typed_func::<(), ()>(&mut store, "init").ok();
        let update = instance
            .get_typed_func::<(f64,), ()>(&mut store, "update")
            .ok();
        let render = instance.get_typed_func::<(), ()>(&mut store, "render").ok();

        // Call init if it exists
        if let Some(init) = init {
            init.call_async(&mut store, ()).await?;
        }

        let mut last_frame = Instant::now();

        event_loop.run(move |event, elwt| {
            elwt.set_control_flow(ControlFlow::Poll);

            match event {
                Event::WindowEvent { event, .. } => {
                    match event {
                        WindowEvent::CloseRequested => {
                            elwt.exit();
                        }
                        WindowEvent::KeyboardInput { event, .. } => {
                            let mut input = input_state.lock().unwrap();
                            let key = format!("{:?}", event.physical_key);

                            if event.state == ElementState::Pressed {
                                input.keys_pressed.insert(key.clone());
                                input.keys_down.insert(key);
                            } else {
                                input.keys_down.remove(&key);
                            }
                        }
                        WindowEvent::Resized(size) => {
                            let mut ws = window_state.lock().unwrap();
                            ws.width = size.width;
                            ws.height = size.height;
                        }
                        WindowEvent::RedrawRequested => {
                            // Render frame
                            if let Some(render) = &render {
                                let _ = pollster::block_on(render.call_async(&mut store, ()));
                            }
                        }
                        _ => {}
                    }
                }
                Event::AboutToWait => {
                    let now = Instant::now();
                    let delta = now.duration_since(last_frame).as_secs_f64();
                    last_frame = now;

                    // Clear pressed keys
                    {
                        let mut input = input_state.lock().unwrap();
                        input.keys_pressed.clear();
                    }

                    // Update
                    if let Some(update) = &update {
                        let _ = pollster::block_on(update.call_async(&mut store, (delta,)));
                    }

                    // Check if should close
                    {
                        let ws = window_state.lock().unwrap();
                        if ws.should_close {
                            elwt.exit();
                        }
                    }

                    window.request_redraw();
                }
                _ => {}
            }
        })?;

        Ok(())
    }

    fn add_host_functions(
        &self,
        linker: &mut Linker<HostState>,
        window_state: Arc<Mutex<WindowState>>,
        input_state: Arc<Mutex<InputState>>,
    ) -> Result<()> {
        // Window functions
        let ws1 = window_state.clone();
        linker.func_wrap(
            "loop:host/window",
            "create",
            move |_caller: Caller<'_, HostState>, title: String, width: u32, height: u32| {
                let mut ws = ws1.lock().unwrap();
                ws.width = width;
                ws.height = height;
                println!("Creating window: {} ({}x{})", title, width, height);
            },
        )?;

        let ws2 = window_state.clone();
        linker.func_wrap(
            "loop:host/window",
            "show",
            move |_caller: Caller<'_, HostState>| {
                println!("Showing window");
            },
        )?;

        let ws3 = window_state.clone();
        linker.func_wrap(
            "loop:host/window",
            "close",
            move |_caller: Caller<'_, HostState>| {
                let mut ws = ws3.lock().unwrap();
                ws.should_close = true;
            },
        )?;

        let ws4 = window_state.clone();
        linker.func_wrap(
            "loop:host/window",
            "clear",
            move |_caller: Caller<'_, HostState>, r: f32, g: f32, b: f32, a: f32| {
                let mut ws = ws4.lock().unwrap();
                ws.clear_color = [r, g, b, a];
            },
        )?;

        // Input functions
        let is1 = input_state.clone();
        linker.func_wrap(
            "loop:host/input",
            "is-key-pressed",
            move |_caller: Caller<'_, HostState>, key: String| -> u32 {
                let input = is1.lock().unwrap();
                input.keys_pressed.contains(&key) as u32
            },
        )?;

        let is2 = input_state.clone();
        linker.func_wrap(
            "loop:host/input",
            "is-key-down",
            move |_caller: Caller<'_, HostState>, key: String| -> u32 {
                let input = is2.lock().unwrap();
                input.keys_down.contains(&key) as u32
            },
        )?;

        // Log functions
        linker.func_wrap(
            "loop:host/log",
            "info",
            |_caller: Caller<'_, HostState>, msg: String| {
                println!("[INFO] {}", msg);
            },
        )?;

        Ok(())
    }
}
