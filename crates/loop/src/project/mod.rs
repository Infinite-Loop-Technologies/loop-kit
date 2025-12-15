// src/project/mod.rs
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct LoopConfig {
    pub project: ProjectConfig,
    pub build: BuildConfig,
    pub runtime: RuntimeConfig,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BuildConfig {
    pub target: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RuntimeConfig {
    pub memory_limit: String,
}

impl LoopConfig {
    pub fn load(path: &Path) -> Result<Self> {
        let config_path = path.join("loop.toml");
        let contents = std::fs::read_to_string(config_path)?;
        let config: LoopConfig = toml::from_str(&contents)?;
        Ok(config)
    }
}
