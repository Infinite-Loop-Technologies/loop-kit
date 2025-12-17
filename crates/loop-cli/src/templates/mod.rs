// crates/loop-cli/src/templates/mod.rs
use anyhow::Result;
use std::path::PathBuf;

pub trait TemplateLoader {
    fn load(&self, name: &str) -> Result<PathBuf>;
}

pub struct LocalTemplateLoader {
    base_dir: PathBuf,
}

pub struct GitTemplateLoader {
    repo_url: String,
}

pub struct UrlTemplateLoader {
    base_url: String,
}

// Implementations would download/clone to a temp dir and return the path
