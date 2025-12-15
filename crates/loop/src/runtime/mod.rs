// src/runtime/mod.rs
use anyhow::{Context, Result};
use std::path::Path;
use wasmtime::component::{Component, Linker};
use wasmtime::{Config, Engine, Store};
use wasmtime_wasi::{WasiCtx, WasiCtxBuilder, WasiView};

pub struct Runtime {
    engine: Engine,
}

struct State {
    wasi: WasiCtx,
    window_system: crate::host::window::WindowSystem,
}

impl WasiView for State {
    fn table(&mut self) -> &mut wasmtime_wasi::ResourceTable {
        self.wasi.table()
    }
    
    fn ctx(&mut self) -> &mut WasiCtx {
        &mut self.wasi
    }
}

impl Runtime {
    pub fn new() -> Result<Self> {
        let mut config = Config::new();
        config.wasm_component_model(true);
        config.async_support(true);
        
        let engine = Engine::new(&config)?;
        
        Ok(Runtime { engine })
    }
    
    pub async fn run(&self, wasm_path: &Path) -> Result<()> {
        let component = Component::from_file(&self.engine, wasm_path)
            .context("Failed to load WASM component")?;
        
        let mut linker = Linker::new(&self.engine);
        
        // Add WASI support
        wasmtime_wasi::add_to_linker_async(&mut linker)?;
        
        // Add our custom host functions
        crate::host::window::add_to_linker(&mut linker)?;
        crate::host::graphics::add_to_linker(&mut linker)?;
        
        // Create store with state
        let wasi = WasiCtxBuilder::new()
            .inherit_stdio()
            .inherit_env()
            .build();
        
        let state = State {
            wasi,
            window_system: crate::host::window::WindowSystem::new(),
        };
        
        let mut store = Store::new(&self.engine, state);
        
        // Instantiate and run
        let instance = linker
            .instantiate_async(&mut store, &component)
            .await
            .context("Failed to instantiate component")?;
        
        // Call the exported run function
        let run_func = instance
            .get_func(&mut store, "run")
            .context("Failed to find 'run' export")?;
        
        // Run in a separate task to handle window events
        let window_system = store.data().window_system.clone();
        
        tokio::spawn(async move {
            run_func
                .call_async(&mut store, &[], &mut [])
                .await
                .expect("Failed to call run function");
        });
        
        // Run the window event loop
        window_system.run_event_loop();
        
        Ok(())
    }
}