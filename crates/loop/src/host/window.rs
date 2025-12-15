// src/host/window.rs
use anyhow::Result;
use crossbeam_channel::{bounded, Sender};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tao::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop, EventLoopBuilder},
    window::{Window, WindowBuilder},
};
use wasmtime::component::Linker;

#[derive(Clone)]
pub struct WindowSystem {
    windows: Arc<Mutex<HashMap<u32, Arc<Window>>>>,
    event_tx: Sender<WindowCommand>,
}

enum WindowCommand {
    CreateWindow {
        config: WindowConfig,
        response: Sender<Result<u32>>,
    },
    ShowWindow(u32),
    CloseWindow(u32),
}

#[derive(Debug, Clone)]
pub struct WindowConfig {
    pub title: String,
    pub width: u32,
    pub height: u32,
    pub resizable: bool,
}

#[derive(Debug, Clone, Copy)]
pub struct WindowHandle {
    pub id: u32,
}

impl WindowSystem {
    pub fn new() -> Self {
        let (tx, _rx) = bounded(100);
        WindowSystem {
            windows: Arc::new(Mutex::new(HashMap::new())),
            event_tx: tx,
        }
    }

    pub fn run_event_loop(self) {
        let event_loop = EventLoopBuilder::new().build();
        let windows = self.windows.clone();

        event_loop.run(move |event, event_loop, control_flow| {
            *control_flow = ControlFlow::Wait;

            match event {
                Event::WindowEvent {
                    event: WindowEvent::CloseRequested,
                    window_id,
                } => {
                    let mut windows_guard = windows.lock().unwrap();
                    windows_guard.retain(|_, w| w.id() != window_id);

                    if windows_guard.is_empty() {
                        *control_flow = ControlFlow::Exit;
                    }
                }
                _ => {}
            }
        });
    }
}

pub fn add_to_linker<T>(linker: &mut Linker<T>) -> Result<()>
where
    T: Send + 'static,
{
    // Define the window interface bindings
    linker.func_wrap(
        "loop:host/window",
        "create-window",
        |mut caller: wasmtime::Caller<'_, T>, config: WindowConfig| -> Result<WindowHandle> {
            // Implementation for creating windows
            let window = WindowBuilder::new()
                .with_title(&config.title)
                .with_inner_size(tao::dpi::LogicalSize::new(config.width, config.height))
                .with_resizable(config.resizable)
                .build(&EventLoop::new())
                .map_err(|e| anyhow::anyhow!("Failed to create window: {}", e))?;

            let id = window.id().into();
            Ok(WindowHandle { id })
        },
    )?;

    linker.func_wrap(
        "loop:host/window",
        "show-window",
        |_caller: wasmtime::Caller<'_, T>, handle: WindowHandle| {
            // Show window implementation
            println!("Showing window with id: {}", handle.id);
        },
    )?;

    linker.func_wrap(
        "loop:host/window",
        "close-window",
        |_caller: wasmtime::Caller<'_, T>, handle: WindowHandle| {
            // Close window implementation
            println!("Closing window with id: {}", handle.id);
        },
    )?;

    Ok(())
}
