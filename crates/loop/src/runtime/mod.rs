pub mod window;
pub mod host;

use anyhow::{Context, Result};
use std::path::Path;
use wasmtime::*;
use wasmtime::component::*;
use wasmtime_wasi::{WasiCtx, WasiCtxBuilder, WasiView};

use crate::runtime::window::WindowManager;

pub struct HostState {
    wasi: WasiCtx,
    window_manager: WindowManager,
}

impl WasiView for HostState {
    fn ctx(&mut self) -> &mut WasiCtx {
        &mut self.wasi
    }

    fn table(&mut self) -> &mut wasmtime::component::ResourceTable {
        self.wasi.table()
    }
}

pub async fn run_component(component_path: &Path) -> Result<()> {
    let mut config = Config::new();
    config.wasm_component_model(true);
    config.async_support(true);
    
    let engine = Engine::new(&config)?;
    let mut linker = Linker::new(&engine);

    // Add WASI support
    wasmtime_wasi::add_to_linker_async(&mut linker)?;
    
    // Add our custom window APIs
    window::add_to_linker(&mut linker)?;

    let wasi = WasiCtxBuilder::new()
        .inherit_stdio()
        .inherit_env()
        .build();

    let state = HostState {
        wasi,
        window_manager: WindowManager::new(),
    };

    let mut store = Store::new(&engine, state);

    let component = Component::from_file(&engine, component_path)
        .context("Failed to load component")?;

    let instance = linker.instantiate_async(&mut store, &component).await?;

    // Call the main function or run export
    if let Ok(func) = instance.get_typed_func::<(), ()>(&mut store, "run") {
        func.call_async(&mut store, ()).await?;
    } else if let Ok(func) = instance.get_typed_func::<(), ()>(&mut store, "_start") {
        func.call_async(&mut store, ()).await?;
    } else {
        println!("Component loaded successfully (no run/start export found)");
    }

    Ok(())
}