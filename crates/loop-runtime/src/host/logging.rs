// crates/loop-runtime/src/host/logging.rs
//! Logging interface implementation

use super::HostState;
use crate::loop_::kit::logging::{Host, Level};
use tracing::{debug, error, info, trace, warn};

impl Host for HostState {
    fn log(&mut self, level: Level, message: String) {
        match level {
            Level::Trace => trace!(target: "guest", "{}", message),
            Level::Debug => debug!(target: "guest", "{}", message),
            Level::Info => info!(target: "guest", "{}", message),
            Level::Warn => warn!(target: "guest", "{}", message),
            Level::Error => error!(target: "guest", "{}", message),
        }
    }

    fn trace(&mut self, message: String) {
        self.log(Level::Trace, message);
    }

    fn debug(&mut self, message: String) {
        self.log(Level::Debug, message);
    }

    fn info(&mut self, message: String) {
        self.log(Level::Info, message);
    }

    fn warn(&mut self, message: String) {
        self.log(Level::Warn, message);
    }

    fn error(&mut self, message: String) {
        self.log(Level::Error, message);
    }
}
