// crates/loop-cli/src/commands/new.rs
use anyhow::{Context, Result, bail};
use clap::Args;
use console::style;
use std::{fs, path::PathBuf};
use tera::Tera;

use super::{print_info, print_success};

#[derive(Args)]
pub struct NewArgs {
    /// Project name
    name: String,

    /// Template to use
    #[arg(short, long, default_value = "rust")]
    template: String,
}

pub fn execute(args: NewArgs) -> Result<()> {
    let name = &args.name;
    let path = PathBuf::from(name);

    // Validate project doesn't exist
    if path.exists() {
        bail!("Directory already exists: {}", path.display());
    }

    print_info(&format!("Creating project '{}'...", style(name).cyan()));

    // Get template directory
    let template_dir = get_template_dir(&args.template)?;

    // Create the project
    create_project(&path, &template_dir, name)?;

    print_success(&format!("Created project '{}'", name));
    print_next_steps(name);

    Ok(())
}

fn get_template_dir(template_name: &str) -> Result<PathBuf> {
    // For now, use local templates. In future, this can dispatch to
    // different template loaders (git, URL, OCI, etc.)
    let template_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("templates")
        .join(template_name);

    if !template_dir.exists() {
        bail!(
            "Template '{}' not found at {:?}",
            template_name,
            template_dir
        );
    }

    Ok(template_dir)
}

fn create_project(project_path: &PathBuf, template_dir: &PathBuf, name: &str) -> Result<()> {
    // Setup Tera with the template directory
    let pattern = format!("{}/**/*.tera", template_dir.display());
    let mut tera = Tera::new(&pattern).context("Failed to load templates")?;

    // Disable auto-escaping since we're generating code
    tera.autoescape_on(vec![]);

    // Create template context
    let mut context = tera::Context::new();
    context.insert("project_name", name);
    context.insert("struct_name", &to_pascal_case(name));

    // Create project directories
    fs::create_dir_all(project_path)?;

    // Process all template files
    render_templates(project_path, &tera, &context)?;

    Ok(())
}

fn render_templates(project_path: &PathBuf, tera: &Tera, context: &tera::Context) -> Result<()> {
    // Template files and their output locations
    let templates = [
        ("Cargo.toml.tera", "Cargo.toml"),
        ("config.toml.tera", ".cargo/config.toml"),
        ("deps.toml.tera", "wit/deps.toml"),
        ("world.wit.tera", "wit/world.wit"),
        ("lib.rs.tera", "src/lib.rs"),
        ("gitignore.tera", ".gitignore"),
    ];

    for (template_name, output_path) in &templates {
        // Render template
        let content = tera
            .render(template_name, context)
            .with_context(|| format!("Failed to render template: {}", template_name))?;

        // Create output file with directories
        let full_path = project_path.join(output_path);
        if let Some(parent) = full_path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(&full_path, content)
            .with_context(|| format!("Failed to write file: {}", output_path))?;
    }

    Ok(())
}

fn print_next_steps(name: &str) {
    println!("\n  Next steps:");
    println!("    cd {}", name);
    println!("    wit-deps  # Fetch WIT dependencies");
    println!("    loop build");
    println!("    loop run\n");
}

fn to_pascal_case(s: &str) -> String {
    s.split(|c: char| !c.is_alphanumeric())
        .filter(|s| !s.is_empty())
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                None => String::new(),
                Some(first) => first.to_uppercase().chain(chars).collect(),
            }
        })
        .collect()
}
