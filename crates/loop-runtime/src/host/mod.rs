// crates/loop-runtime/src/host/mod.rs
//! Host implementations for WIT interfaces

mod canvas;
mod logging;
pub mod types;
mod window;

use std::sync::Arc;
use winit::window::Window;

pub use types::*;

/// The host state that implements all WIT interfaces
pub struct HostState {
    window: Arc<Window>,
    window_config: Option<WindowConfig>,
    cursor_position: Option<(f64, f64)>,
    cursor_visible: bool,
    should_exit: bool,
    canvas_buffer: Vec<u32>,
    canvas_width: u32,
    canvas_height: u32,
}

#[derive(Debug, Clone)]
pub struct WindowConfig {
    pub title: String,
    pub width: u32,
    pub height: u32,
    pub resizable: bool,
    pub decorated: bool,
    pub transparent: bool,
}

impl HostState {
    pub fn new(window: Arc<Window>) -> Self {
        Self {
            window,
            window_config: None,
            cursor_position: None,
            cursor_visible: true,
            should_exit: false,
            canvas_buffer: Vec::new(),
            canvas_width: 0,
            canvas_height: 0,
        }
    }

    pub fn window_config(&self) -> Option<&WindowConfig> {
        self.window_config.as_ref()
    }

    pub fn should_exit(&self) -> bool {
        self.should_exit
    }

    pub fn set_cursor_position(&mut self, pos: Option<(f64, f64)>) {
        self.cursor_position = pos;
    }

    pub fn set_canvas_size(&mut self, width: u32, height: u32) {
        if self.canvas_width != width || self.canvas_height != height {
            self.canvas_width = width;
            self.canvas_height = height;
            self.canvas_buffer.resize((width * height) as usize, 0);
        }
    }

    pub fn canvas_buffer(&self) -> &[u32] {
        &self.canvas_buffer
    }
}
