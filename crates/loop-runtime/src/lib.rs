// crates/loop-runtime/src/lib.rs
use std::sync::Arc;

use anyhow::{Context, Result};
use futures::executor::block_on;
use wasmtime::{
    Config, Engine, Store,
    component::{Component, Linker},
};

use wasmtime_wasi::{WasiCtx, WasiCtxView, WasiView};

use wasmtime_wasi::ResourceTable;

use wasi_frame_buffer_wasmtime::WasiFrameBufferView;
use wasi_graphics_context_wasmtime::WasiGraphicsContextView;
use wasi_surface_wasmtime::{Surface, SurfaceDesc, WasiSurfaceView};
use wasmtime_wasi_io::IoView;

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
        let mut builder = WasiCtx::builder();

        // Optional but handy; doesn’t hurt window apps.
        builder.inherit_stdio();

        WorkloadState {
            ctx: builder.build(),
            table: ResourceTable::new(),
            main_thread_proxy: Arc::clone(&self.main_thread_proxy),
        }
    }
}

/// Per-component Store state
struct WorkloadState {
    ctx: WasiCtx,
    table: ResourceTable,
    main_thread_proxy: Arc<wasi_surface_wasmtime::WasiWinitEventLoopProxy>,
}

impl IoView for WorkloadState {
    fn table(&mut self) -> &mut ResourceTable {
        &mut self.table
    }
}

impl WasiView for WorkloadState {
    fn ctx(&mut self) -> WasiCtxView<'_> {
        WasiCtxView {
            ctx: &mut self.ctx,
            table: &mut self.table,
        }
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

    pub fn run(&self, component_path: &std::path::Path) -> Result<()> {
        let (event_loop, proxy) = wasi_surface_wasmtime::create_wasi_winit_event_loop();
        let host = HostState::new(proxy);

        let mut config = Config::default();
        config.wasm_component_model(true);
        config.async_support(true);

        if self.config.debug {
            config.debug_info(true);
            // maybe: config.wasm_backtrace_details(wasmtime::WasmBacktraceDetails::Enable);
            // maybe: enable logging / profiling
        }

        let engine = Engine::new(&config)?;
        let mut linker: Linker<WorkloadState> = Linker::new(&engine);

        // ✅ THIS is what prevents: "map entry `wasi:io/error@...` defined twice"
        // Code smell
        // linker.allow_shadowing(true);

        // keep this (it’s what fixes missing wasi:cli/environment)
        wasmtime_wasi::p2::add_to_linker_async(&mut linker)?;

        // keep wasi-gfx linkers
        wasi_frame_buffer_wasmtime::add_to_linker(&mut linker)?;
        wasi_graphics_context_wasmtime::add_to_linker(&mut linker)?;
        wasi_surface_wasmtime::add_to_linker(&mut linker)?;

        // Add our custom `log` import
        linker.root().func_wrap(
            "log",
            |_caller: wasmtime::StoreContextMut<'_, WorkloadState>, (message,): (String,)| {
                println!("[guest] {}", message);
                Ok(())
            },
        )?;

        let component = Component::from_file(&engine, component_path)
            .with_context(|| format!("Failed to load {}", component_path.display()))?;

        // let mut store = Store::new(&engine, host.new_workload());

        // Spawn the component execution in a background thread
        // because the event loop must run on the main thread
        let engine_clone = engine.clone();
        let component_clone = component.clone();
        let linker_clone = linker.clone();
        let workload = host.new_workload();

        // let instance = linker
        //     .instantiate_async(&mut store, &component)
        //     .await
        //     .context("instantiate failed")?;

        // // TODO - maybe call an entry point or something?

        // event_loop.run();
        // Ok(())

        std::thread::spawn(move || {
            let rt = tokio::runtime::Runtime::new().expect("Failed to create tokio runtime");
            rt.block_on(async {
                let mut store = Store::new(&engine_clone, workload);

                match linker_clone
                    .instantiate_async(&mut store, &component_clone)
                    .await
                {
                    Ok(instance) => {
                        // Get the `start` export and call it
                        match instance.get_typed_func::<(), ()>(&mut store, "start") {
                            Ok(start_func) => {
                                if let Err(e) = start_func.call_async(&mut store, ()).await {
                                    eprintln!("[runtime] Component start() error: {}", e);
                                }
                            }
                            Err(e) => {
                                eprintln!("[runtime] Failed to get start function: {}", e);
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("[runtime] Failed to instantiate component: {}", e);
                    }
                }
            });
        });

        // Run the event loop on the main thread (blocks until window closes)
        event_loop.run();

        Ok(())
    }
}
