// crates/loop-runtime/src/lib.rs
//! Loop-Kit Runtime
//!
//! Executes loop-kit WASM components with windowing capabilities via wasi:gfx.

use std::path::Path;
use std::sync::Arc;

use anyhow::{Context, Result};
use futures::executor::block_on;
use tracing::info;
use wasi_frame_buffer_wasmtime::WasiFrameBufferView;
use wasi_graphics_context_wasmtime::WasiGraphicsContextView;
use wasi_surface_wasmtime::{Surface, SurfaceDesc, WasiSurfaceView};
use wasmtime::component::{Component, Linker};
use wasmtime::{Config, Engine, Store};
use wasmtime_wasi::ResourceTable;
use wasmtime_wasi_io::IoView;

// Generate bindings for our world
wasmtime::component::bindgen!({
    path: "../../wit",
    world: "app",
    async: true,
    require_store_data_send: true,
    with: {
        "wasi:graphics-context/graphics-context": wasi_graphics_context_wasmtime::wasi::graphics_context::graphics_context,
        "wasi:surface/surface": wasi_surface_wasmtime::wasi::surface::surface,
        "wasi:frame-buffer/frame-buffer": wasi_frame_buffer_wasmtime::wasi::frame_buffer::frame_buffer,
    },
});

/// Runtime configuration
#[derive(Debug, Clone)]
pub struct RuntimeConfig {
    pub debug: bool,
}

impl Default for RuntimeConfig {
    fn default() -> Self {
        Self { debug: false }
    }
}

/// Host state shared across all workloads
struct HostState {
    main_thread_proxy: Arc<wasi_surface_wasmtime::WasiWinitEventLoopProxy>,
}

impl HostState {
    fn new(main_thread_proxy: wasi_surface_wasmtime::WasiWinitEventLoopProxy) -> Self {
        Self {
            main_thread_proxy: Arc::new(main_thread_proxy),
        }
    }

    fn create_workload(&self) -> WorkloadState {
        WorkloadState {
            table: ResourceTable::new(),
            main_thread_proxy: Arc::clone(&self.main_thread_proxy),
        }
    }
}

/// Per-component workload state
struct WorkloadState {
    table: ResourceTable,
    main_thread_proxy: Arc<wasi_surface_wasmtime::WasiWinitEventLoopProxy>,
}

// Implement required traits for wasmtime
impl wasmtime::component::HasData for WorkloadState {
    type Data<'a> = &'a mut WorkloadState;
}

// IoView is required by the WASI interfaces
impl IoView for WorkloadState {
    fn table(&mut self) -> &mut ResourceTable {
        &mut self.table
    }
}

// Implement the WASI GFX view traits
impl WasiGraphicsContextView for WorkloadState {}
impl WasiFrameBufferView for WorkloadState {}

impl WasiSurfaceView for WorkloadState {
    fn create_canvas(&self, desc: SurfaceDesc) -> Surface {
        block_on(self.main_thread_proxy.create_window(desc))
    }
}

// Implement our custom imports
impl AppImports for WorkloadState {
    fn print(&mut self, s: String) {
        println!("[guest] {}", s);
    }
}

/// The main runtime that executes loop-kit components
pub struct Runtime {
    config: RuntimeConfig,
}

impl Runtime {
    /// Create a new runtime
    pub fn new(config: RuntimeConfig) -> Self {
        Self { config }
    }

    /// Run a component from the given path
    pub fn run(&self, component_path: &Path) -> Result<()> {
        // Initialize logging
        if self.config.debug {
            env_logger::builder()
                .filter_level(log::LevelFilter::Debug)
                .init();
        } else {
            env_logger::builder()
                .filter_level(log::LevelFilter::Info)
                .init();
        }

        info!("Loading component: {}", component_path.display());

        // Create the winit event loop - this must be on the main thread
        let (main_thread_loop, main_thread_proxy) =
            wasi_surface_wasmtime::create_wasi_winit_event_loop();

        let host_state = HostState::new(main_thread_proxy);

        // Configure wasmtime
        let mut config = Config::default();
        config.wasm_component_model(true);
        config.async_support(true);

        let engine = Engine::new(&config)?;
        let mut linker: Linker<WorkloadState> = Linker::new(&engine);

        // Add WASI GFX interfaces to linker
        wasi_frame_buffer_wasmtime::add_to_linker(&mut linker)?;
        wasi_graphics_context_wasmtime::add_to_linker(&mut linker)?;
        wasi_surface_wasmtime::add_to_linker(&mut linker)?;

        // Add our custom imports
        App::add_to_linker_imports::<_, WorkloadState>(&mut linker, |x| x)?;

        // Create store with workload state
        let workload_state = host_state.create_workload();
        let mut store = Store::new(&engine, workload_state);

        // Load the component
        let component = Component::from_file(&engine, component_path)
            .with_context(|| format!("Failed to load component: {}", component_path.display()))?;

        // Build the tokio runtime for async execution
        let rt = tokio::runtime::Runtime::new()?;

        // Spawn the WASM execution on a separate task
        rt.spawn(async move {
            let instance = App::instantiate_async(&mut store, &component, &linker)
                .await
                .expect("Failed to instantiate component");

            instance
                .call_start(&mut store)
                .await
                .expect("Component start failed");
        });

        // Run the main event loop (this blocks)
        info!("Starting event loop");
        main_thread_loop.run();

        Ok(())
    }
}
