// crates/loop-cli/src/commands/new.rs
use anyhow::{Context, Result, bail};
use clap::Args;
use console::style;
use std::{fs, path::PathBuf};
use tera::{Context as TeraContext, Tera};

use super::{print_info, print_success};

#[derive(Args)]
pub struct NewArgs {
    /// Project name
    name: String,

    /// Template to use
    #[arg(short, long, default_value = "rust")]
    template: String,

    /// Custom template delimiters (e.g., "<<,>>")
    #[arg(long)]
    delimiters: Option<String>,
}

pub fn execute(args: NewArgs) -> Result<()> {
    let name = &args.name;
    let path = PathBuf::from(name);

    if path.exists() {
        bail!("Directory already exists: {}", path.display());
    }

    print_info(&format!("Creating project '{}'...", style(name).cyan()));

    // Load templates
    let template_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("templates")
        .join(&args.template);

    if !template_dir.exists() {
        bail!("Template '{}' not found", args.template);
    }

    // Setup Tera
    let mut tera = Tera::new(template_dir.join("**/*").to_str().unwrap())
        .context("Failed to load templates")?;

    // Override delimiters if specified
    if let Some(delims) = &args.delimiters {
        let parts: Vec<&str> = delims.split(',').collect();
        if parts.len() == 2 {
            tera.autoescape_on(vec![]);
            // Note: Tera doesn't support custom delimiters easily,
            // but we can use raw blocks to avoid conflicts
        }
    }

    // Create context
    let mut context = TeraContext::new();
    context.insert("project_name", name);
    context.insert("struct_name", &to_pascal_case(name));

    // Create project structure
    create_project_from_template(&path, &tera, &context, &template_dir)?;

    print_success(&format!("Created project '{}'", name));
    println!("\n  Next steps:");
    println!("    cd {}", name);
    println!("    wit-deps  # Fetch WIT dependencies");
    println!("    loop build");
    println!("    loop run\n");

    Ok(())
}

fn create_project_from_template(
    project_path: &PathBuf,
    tera: &Tera,
    context: &TeraContext,
    _template_dir: &PathBuf,
) -> Result<()> {
    // Create base directories
    fs::create_dir_all(project_path.join("src"))?;
    fs::create_dir_all(project_path.join("wit"))?;
    fs::create_dir_all(project_path.join(".cargo"))?;

    // Define template files and their destinations
    let templates = vec![
        ("Cargo.toml.tera", "Cargo.toml"),
        (".cargo/config.toml.tera", ".cargo/config.toml"),
        ("wit/deps.toml.tera", "wit/deps.toml"),
        ("wit/world.wit.tera", "wit/world.wit"),
        ("src/lib.rs.tera", "src/lib.rs"),
        (".gitignore.tera", ".gitignore"),
    ];

    for (template_name, dest_path) in templates {
        let content = tera
            .render(template_name, context)
            .context(format!("Failed to render template: {}", template_name))?;

        let dest_full_path = project_path.join(dest_path);
        if let Some(parent) = dest_full_path.parent() {
            fs::create_dir_all(parent)?;
        }

        fs::write(&dest_full_path, content)
            .context(format!("Failed to write file: {}", dest_path))?;
    }

    Ok(())
}

fn to_pascal_case(s: &str) -> String {
    s.split(|c: char| !c.is_alphanumeric())
        .filter(|s| !s.is_empty())
        .map(|s| {
            let mut c = s.chars();
            match c.next() {
                None => String::new(),
                Some(f) => f.to_uppercase().chain(c).collect(),
            }
        })
        .collect()
}
