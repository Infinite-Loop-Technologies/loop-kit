use anyhow::Result;
use crossbeam_channel::{bounded, Sender, Receiver};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tao::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop, EventLoopProxy},
    window::{Window, WindowBuilder, WindowId},
};
use wasmtime::component::*;

#[derive(Clone)]
pub struct WindowManager {
    inner: Arc<Mutex<WindowManagerInner>>,
}

struct WindowManagerInner {
    windows: HashMap<u32, WindowHandle>,
    next_id: u32,
    event_loop_proxy: Option<EventLoopProxy<CustomEvent>>,
}

struct WindowHandle {
    id: WindowId,
    title: String,
}

#[derive(Debug)]
enum CustomEvent {
    CreateWindow { id: u32, title: String, width: u32, height: u32 },
    CloseWindow { id: u32 },
}

impl WindowManager {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(WindowManagerInner {
                windows: HashMap::new(),
                next_id: 1,
                event_loop_proxy: None,
            })),
        }
    }

    pub fn create_window(&self, title: String, width: u32, height: u32) -> Result<u32> {
        let mut inner = self.inner.lock().unwrap();
        let id = inner.next_id;
        inner.next_id += 1;

        if let Some(proxy) = &inner.event_loop_proxy {
            proxy.send_event(CustomEvent::CreateWindow {
                id,
                title: title.clone(),
                width,
                height,
            }).map_err(|e| anyhow::anyhow!("Failed to send window create event: {:?}", e))?;
        }

        Ok(id)
    }

    pub fn close_window(&self, id: u32) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        
        if let Some(proxy) = &inner.event_loop_proxy {
            proxy.send_event(CustomEvent::CloseWindow { id })
                .map_err(|e| anyhow::anyhow!("Failed to send window close event: {:?}", e))?;
        }

        Ok(())
    }

    pub fn set_event_loop_proxy(&self, proxy: EventLoopProxy<CustomEvent>) {
        let mut inner = self.inner.lock().unwrap();
        inner.event_loop_proxy = Some(proxy);
    }
}

// WIT interface definition for window management
wasmtime::component::bindgen!({
    inline: r#"
        package loop:window;

        interface window {
            record window-config {
                title: string,
                width: u32,
                height: u32,
            }

            create-window: func(config: window-config) -> u32;
            close-window: func(id: u32);
            set-window-title: func(id: u32, title: string);
        }

        world loop-world {
            import window;
        }
    "#,
});

pub fn add_to_linker(linker: &mut wasmtime::component::Linker<crate::runtime::HostState>) -> Result<()> {
    linker.root().func_wrap(
        "create-window",
        |mut caller: wasmtime::StoreContextMut<'_, crate::runtime::HostState>,
         (title, width, height): (String, u32, u32)| {
            Box::new(async move {
                let id = caller.data().window_manager.create_window(title, width, height)?;
                Ok((id,))
            })
        },
    )?;

    linker.root().func_wrap(
        "close-window",
        |mut caller: wasmtime::StoreContextMut<'_, crate::runtime::HostState>, (id,): (u32,)| {
            Box::new(async move {
                caller.data().window_manager.close_window(id)?;
                Ok(())
            })
        },
    )?;

    Ok(())
}