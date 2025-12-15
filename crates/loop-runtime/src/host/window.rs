// crates/loop-runtime/src/host/window.rs
//! Window interface implementation

use super::{HostState, WindowConfig};
use crate::loop_::kit::types as wit_types;
use crate::loop_::kit::window::Host;
use winit::dpi::LogicalSize;

impl Host for HostState {
    fn configure(&mut self, config: wit_types::WindowConfig) {
        self.window_config = Some(WindowConfig {
            title: config.title.clone(),
            width: config.width,
            height: config.height,
            resizable: config.resizable,
            decorated: config.decorated,
            transparent: config.transparent,
        });

        // Apply config to window
        self.window.set_title(&config.title);
        self.window.set_resizable(config.resizable);
        self.window.set_decorations(config.decorated);
        let _ = self
            .window
            .request_inner_size(LogicalSize::new(config.width, config.height));
    }

    fn get_size(&mut self) -> wit_types::Size {
        let size = self.window.inner_size();
        wit_types::Size {
            width: size.width,
            height: size.height,
        }
    }

    fn set_size(&mut self, width: u32, height: u32) {
        let _ = self
            .window
            .request_inner_size(LogicalSize::new(width, height));
    }

    fn get_title(&mut self) -> String {
        self.window.title()
    }

    fn set_title(&mut self, title: String) {
        self.window.set_title(&title);
    }

    fn is_focused(&mut self) -> bool {
        self.window.has_focus()
    }

    fn request_close(&mut self) {
        self.should_exit = true;
    }

    fn set_cursor_visible(&mut self, visible: bool) {
        self.cursor_visible = visible;
        self.window.set_cursor_visible(visible);
    }

    fn cursor_position(&mut self) -> Option<wit_types::Point> {
        self.cursor_position.map(|(x, y)| wit_types::Point { x, y })
    }

    fn request_redraw(&mut self) {
        self.window.request_redraw();
    }
}
