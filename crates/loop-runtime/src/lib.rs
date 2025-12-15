// crates/loop-runtime/src/lib.rs

use std::sync::Arc;

use anyhow::{Context, Result};
use futures::executor::block_on;
use wasmtime::{
    Config, Engine, Store,
    component::{Component, Linker},
};

use wasmtime_wasi::ResourceTable;
use wasmtime_wasi_io::IoView;

use wasi_frame_buffer_wasmtime::WasiFrameBufferView;
use wasi_graphics_context_wasmtime::WasiGraphicsContextView;
use wasi_surface_wasmtime::{Surface, SurfaceDesc, WasiSurfaceView};

pub struct RuntimeConfig {
    pub debug: bool,
}

impl Default for RuntimeConfig {
    fn default() -> Self {
        Self { debug: false }
    }
}

/// Long-lived host resources (shared)
struct HostState {
    main_thread_proxy: Arc<wasi_surface_wasmtime::WasiWinitEventLoopProxy>,
}

impl HostState {
    fn new(proxy: wasi_surface_wasmtime::WasiWinitEventLoopProxy) -> Self {
        Self {
            main_thread_proxy: Arc::new(proxy),
        }
    }

    fn new_workload(&self) -> WorkloadState {
        WorkloadState {
            table: ResourceTable::new(),
            main_thread_proxy: Arc::clone(&self.main_thread_proxy),
        }
    }
}

/// Per-component Store state
struct WorkloadState {
    table: ResourceTable,
    main_thread_proxy: Arc<wasi_surface_wasmtime::WasiWinitEventLoopProxy>,
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

pub struct Runtime {
    config: RuntimeConfig,
}

impl Runtime {
    pub fn new(config: RuntimeConfig) -> Result<Self> {
        Ok(Self { config })
    }

    pub async fn run(&self, component_path: &std::path::Path) -> Result<()> {
        let (event_loop, proxy) = wasi_surface_wasmtime::create_wasi_winit_event_loop();
        let host = HostState::new(proxy);

        let mut config = Config::default();
        config.wasm_component_model(true);
        config.async_support(true);

        let engine = Engine::new(&config)?;
        let mut linker: Linker<WorkloadState> = Linker::new(&engine);

        wasi_frame_buffer_wasmtime::add_to_linker(&mut linker)?;
        wasi_graphics_context_wasmtime::add_to_linker(&mut linker)?;
        wasi_surface_wasmtime::add_to_linker(&mut linker)?;

        let component = Component::from_file(&engine, component_path)
            .with_context(|| format!("Failed to load {}", component_path.display()))?;

        let mut store = Store::new(&engine, host.new_workload());

        let instance = linker
            .instantiate_async(&mut store, &component)
            .await
            .context("instantiate failed")?;

        // optional: call a known entrypoint here if you bindgen it

        event_loop.run();
        Ok(())
    }
}
