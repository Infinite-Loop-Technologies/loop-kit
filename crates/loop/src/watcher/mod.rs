// src/watcher/mod.rs
use anyhow::Result;
use std::path::PathBuf;
use std::process::Child;

pub struct DevWatcher {
    project_path: PathBuf,
    current_process: Option<Child>,
}

impl DevWatcher {
    pub fn new(project_path: PathBuf) -> Self {
        DevWatcher {
            project_path,
            current_process: None,
        }
    }
    
    pub async fn rebuild_and_run(&mut self) -> Result<()> {
        // Kill existing process if running
        if let Some(mut process) = self.current_process.take() {
            let _ = process.kill();
            let _ = process.wait();
        }
        
        // Build the project
        crate::commands::build::execute(self.project_path.clone(), false).await?;
        
        // Run the new build
        let project_name = crate::commands::build::get_project_name(&self.project_path)?;
        let wasm_path = self
            .project_path
            .join("target/wasm32-wasi/debug")
            .join(format!("{}.wasm", project_name));
        
        // Create runtime and run
        let runtime = crate::runtime::Runtime::new()?;
        
        // Run in a separate task
        let wasm_path_clone = wasm_path.clone();
        tokio::spawn(async move {
            if let Err(e) = runtime.run(&wasm_path_clone).await {
                eprintln!("Runtime error: {}", e);
            }
        });
        
        Ok(())
    }
}