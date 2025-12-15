use std::sync::Arc;

use anyhow::{Context, Result};
use futures::executor::block_on;
use wasi_frame_buffer_wasmtime::WasiFrameBufferView;
use wasi_graphics_context_wasmtime::WasiGraphicsContextView;
use wasi_surface_wasmtime::{Surface, SurfaceDesc, WasiSurfaceView};
use wasmtime::{
    Config, Engine, Store,
    component::{Component, Linker},
};
use wasmtime_wasi::ResourceTable;
use wasmtime_wasi_io::IoView;

wasmtime::component::bindgen!({
    path: "../wit/",
    world: "app",
    exports: {
        "start": async,
    },
    require_store_data_send: true,
    with: {
        "wasi:graphics-context/graphics-context": wasi_graphics_context_wasmtime::wasi::graphics_context::graphics_context,
        "wasi:surface/surface": wasi_surface_wasmtime::wasi::surface::surface,
        "wasi:frame-buffer/frame-buffer": wasi_frame_buffer_wasmtime::wasi::frame_buffer::frame_buffer,
    },
});

pub struct RuntimeConfig {
    pub debug: bool,
}

impl Default for RuntimeConfig {
    fn default() -> Self {
        Self { debug: false }
    }
}

pub struct Runtime {
    config: RuntimeConfig,
}

impl Runtime {
    pub fn new(config: RuntimeConfig) -> Result<Self> {
        Ok(Self { config })
    }

    pub fn run(&self, component_path: &std::path::Path) -> Result<()> {
        let rt = tokio::runtime::Runtime::new()?;
        rt.block_on(self.run_async(component_path))
    }

    async fn run_async(&self, component_path: &std::path::Path) -> Result<()> {
        // Create winit event loop
        let (main_thread_loop, main_thread_proxy) =
            wasi_surface_wasmtime::create_wasi_winit_event_loop();

        let host_state = HostState::new(main_thread_proxy);

        // Configure Wasmtime engine
        let mut config = Config::default();
        config.wasm_component_model(true);
        config.async_support(true);

        if self.config.debug {
            config.cranelift_debug_verifier(true);
        }

        let engine = Engine::new(&config)?;
        let mut linker: Linker<WorkloadState> = Linker::new(&engine);

        // Add wasi-gfx interfaces
        wasi_frame_buffer_wasmtime::add_to_linker(&mut linker)?;
        wasi_graphics_context_wasmtime::add_to_linker(&mut linker)?;
        wasi_surface_wasmtime::add_to_linker(&mut linker)?;

        // Add our custom imports
        App::add_to_linker_imports::<_, WorkloadState>(&mut linker, |x| x)?;

        let workload_state = host_state.add_workload();
        let mut store = Store::new(&engine, workload_state);

        // Load component
        let component =
            Component::from_file(&engine, component_path).context("Failed to load component")?;

        let instance = App::instantiate_async(&mut store, &component, &linker)
            .await
            .context("Failed to instantiate component")?;

        // Spawn the component's start function
        tokio::spawn(async move {
            if let Err(e) = instance.call_start(&mut store).await {
                eprintln!("Component error: {}", e);
            }
        });

        // Run the window event loop (blocking)
        main_thread_loop.run();

        Ok(())
    }
}

struct HostState {
    main_thread_proxy: Arc<wasi_surface_wasmtime::WasiWinitEventLoopProxy>,
}

impl HostState {
    fn new(main_thread_proxy: wasi_surface_wasmtime::WasiWinitEventLoopProxy) -> Self {
        Self {
            main_thread_proxy: Arc::new(main_thread_proxy),
        }
    }

    fn add_workload(&self) -> WorkloadState {
        WorkloadState {
            table: ResourceTable::new(),
            main_thread_proxy: Arc::clone(&self.main_thread_proxy),
        }
    }
}

struct WorkloadState {
    table: ResourceTable,
    main_thread_proxy: Arc<wasi_surface_wasmtime::WasiWinitEventLoopProxy>,
}

impl wasmtime::component::HasData for WorkloadState {
    type Data<'a> = &'a mut WorkloadState;
}

impl IoView for WorkloadState {
    fn table(&mut self) -> &mut ResourceTable {
        &mut self.table
    }
}

impl WasiGraphicsContextView for WorkloadState {}
impl WasiFrameBufferView for WorkloadState {}

impl WasiSurfaceView for WorkloadState {
    fn create_canvas(&self, desc: SurfaceDesc) -> Surface {
        block_on(self.main_thread_proxy.create_window(desc))
    }
}

// Implement our custom imports
impl AppImports for WorkloadState {
    fn log(&mut self, message: String) {
        println!("[guest] {}", message);
    }
}
