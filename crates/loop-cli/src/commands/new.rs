// crates/loop-cli/src/commands/new.rs
//! Create a new loop-kit project

use std::fs;
use std::path::PathBuf;

use anyhow::{Context, Result, bail};
use clap::Args;
use console::style;
use dialoguer::{theme::ColorfulTheme, Confirm, Input, Select};
use handlebars::Handlebars;
use serde::Serialize;

use super::{print_success, print_info};

#[derive(Args)]
pub struct NewArgs {
    /// Project name
    name: Option<String>,

    /// Project directory (defaults to project name)
    #[arg(short, long)]
    path: Option<PathBuf>,

    /// Template to use
    #[arg(short, long, default_value = "basic")]
    template: String,

    /// Skip interactive prompts
    #[arg(long)]
    non_interactive: bool,
}

#[derive(Serialize)]
struct ProjectContext {
    name: String,
    description: String,
    author: String,
    wit_version: String,
}

pub fn execute(args: NewArgs) -> Result<()> {
    let theme = ColorfulTheme::default();

    // Get project name
    let name = if let Some(name) = args.name {
        name
    } else if args.non_interactive {
        bail!("Project name is required in non-interactive mode");
    } else {
        Input::with_theme(&theme)
            .with_prompt("Project name")
            .default("my-loop-app".to_string())
            .interact_text()?
    };

    // Validate name
    if !name.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '_') {
        bail!("Project name can only contain alphanumeric characters, hyphens, and underscores");
    }

    // Get project path
    let project_path = args.path.unwrap_or_else(|| PathBuf::from(&name));

    if project_path.exists() {
        if args.non_interactive {
            bail!("Directory already exists: {}", project_path.display());
        }
        let overwrite = Confirm::with_theme(&theme)
            .with_prompt(format!(
                "Directory '{}' already exists. Overwrite?",
                project_path.display()
            ))
            .default(false)
            .interact()?;

        if !overwrite {
            bail!("Aborted");
        }
        fs::remove_dir_all(&project_path)?;
    }

    // Get description
    let description = if args.non_interactive {
        format!("A loop-kit application: {}", name)
    } else {
        Input::with_theme(&theme)
            .with_prompt("Description")
            .default(format!("A loop-kit application: {}", name))
            .interact_text()?
    };

    // Get author
    let default_author = std::env::var("USER")
        .or_else(|_| std::env::var("USERNAME"))
        .unwrap_or_else(|_| "author".to_string());

    let author = if args.non_interactive {
        default_author
    } else {
        Input::with_theme(&theme)
            .with_prompt("Author")
            .default(default_author)
            .interact_text()?
    };

    println!();
    print_info(&format!("Creating project '{}'...", style(&name).cyan()));

    // Create context for templates
    let context = ProjectContext {
        name: name.clone(),
        description,
        author,
        wit_version: "0.1.0".to_string(),
    };

    // Create project structure
    create_project(&project_path, &context)?;

    println!();
    print_success(&format!("Created project '{}'", name));
    println!();
    println!("  To get started:");
    println!("    {} {}", style("cd").cyan(), project_path.display());
    println!("    {} build", style("loop").cyan());
    println!("    {} run", style("loop").cyan());
    println!();

    Ok(())
}

fn create_project(path: &PathBuf, context: &ProjectContext) -> Result<()> {
    let mut hbs = Handlebars::new();
    hbs.set_strict_mode(true);

    // Create directories
    fs::create_dir_all(path.join("src"))?;
    fs::create_dir_all(path.join("wit"))?;

    // Cargo.toml
    let cargo_toml = format!(
        r#"[package]
name = "{name}"
version = "0.1.0"
edition = "2024"
description = "{description}"
authors = ["{author}"]

[lib]
crate-type = ["cdylib"]

[dependencies]
wit-bindgen = "0.36"

[profile.release]
opt-level = "s"
lto = true

# Metadata for loop-kit
[package.metadata.loop-kit]
wit-version = "{wit_version}"
"#,
        name = context.name,
        description = context.description,
        author = context.author,
        wit_version = context.wit_version,
    );
    fs::write(path.join("Cargo.toml"), cargo_toml)?;

    // .cargo/config.toml
    fs::create_dir_all(path.join(".cargo"))?;
    let cargo_config = r#"[build]
target = "wasm32-wasip2"

[target.wasm32-wasip2]
runner = "loop run"
"#;
    fs::write(path.join(".cargo/config.toml"), cargo_config)?;

    // src/lib.rs
    let lib_rs = format!(
        r#"//! {description}

wit_bindgen::generate!({{
    world: "app",
    path: "wit",
}});

struct {struct_name};

impl Guest for {struct_name} {{
    fn init() {{
        // Configure the window
        let config = loop_::kit::types::WindowConfig {{
            title: "{name}".to_string(),
            width: 800,
            height: 600,
            resizable: true,
            decorated: true,
            transparent: false,
        }};
        loop_::kit::window::configure(&config);
        
        loop_::kit::logging::info(&format!("{{}} initialized!", "{name}"));
    }}

    fn update(_delta_us: u64) {{
        // Update logic here
    }}

    fn on_event(event: loop_::kit::types::Event) -> loop_::kit::types::EventResult {{
        use loop_::kit::types::{{Event, EventResult, KeyCode}};
        
        match event {{
            Event::CloseRequested => EventResult::Exit,
            Event::KeyPressed(KeyCode::Escape) => EventResult::Exit,
            Event::KeyPressed(key) => {{
                loop_::kit::logging::debug(&format!("Key pressed: {{:?}}", key));
                EventResult::Handled
            }}
            Event::MouseMoved(pos) => {{
                // Track mouse position if needed
                EventResult::Ignored
            }}
            _ => EventResult::Ignored,
        }}
    }}

    fn render() {{
        use loop_::kit::types::{{Color, Rect}};
        use loop_::kit::canvas;
        
        // Clear with a dark blue background
        canvas::begin_frame(&Color {{
            r: 0.1,
            g: 0.1,
            b: 0.2,
            a: 1.0,
        }});
        
        // Draw a white rectangle
        canvas::fill_rect(
            &Rect {{
                x: 100.0,
                y: 100.0,
                width: 200.0,
                height: 150.0,
            }},
            &Color {{
                r: 1.0,
                g: 1.0,
                b: 1.0,
                a: 1.0,
            }},
        );
        
        // Draw a red circle
        canvas::fill_circle(
            400.0,
            300.0,
            50.0,
            &Color {{
                r: 1.0,
                g: 0.2,
                b: 0.2,
                a: 1.0,
            }},
        );
        
        // Draw some lines
        canvas::draw_line(
            50.0, 50.0,
            750.0, 50.0,
            &Color {{ r: 0.0, g: 1.0, b: 0.5, a: 1.0 }},
            3.0,
        );
        
        canvas::end_frame();
    }}
}}

export!({struct_name});
"#,
        description = context.description,
        name = context.name,
        struct_name = to_pascal_case(&context.name),
    );
    fs::write(path.join("src/lib.rs"), lib_rs)?;

    // Copy WIT files
    copy_wit_files(path)?;

    // .gitignore
    let gitignore = r#"target/
*.wasm
"#;
    fs::write(path.join(".gitignore"), gitignore)?;

    // README.md
    let readme = format!(
        r#"# {name}

{description}

## Building

```bash
loop build
```

## Running

```bash
loop run
```

## Development

This project uses loop-kit for building
WASM components with windowing capabilities.

The WIT interface definitions in wit/ describe the capabilities available to
your application.
"#,
name = context.name,
description = context.description,
);
fs::write(path.join("README.md"), readme)?;

```
    Ok(())
}
fn copy_wit_files(project_path: &PathBuf) -> Result<()> {
let wit_dir = project_path.join("wit");

// types.wit
let types_wit = include_str!("../../../../wit/types.wit");
fs::write(wit_dir.join("types.wit"), types_wit)?;

// window.wit
let window_wit = include_str!("../../../../wit/window.wit");
fs::write(wit_dir.join("window.wit"), window_wit)?;

// canvas.wit
let canvas_wit = include_str!("../../../../wit/canvas.wit");
fs::write(wit_dir.join("canvas.wit"), canvas_wit)?;

// logging.wit
let logging_wit = include_str!("../../../../wit/logging.wit");
fs::write(wit_dir.join("logging.wit"), logging_wit)?;

// world.wit
let world_wit = include_str!("../../../../wit/world.wit");
fs::write(wit_dir.join("world.wit"), world_wit)?;

Ok(())

}

fn to_pascal_case(s: &str) -> String {
s.split(|c| c == '-' || c == '_')
.map(|word| {
let mut chars = word.chars();
match chars.next() {
None => String::new(),
Some(first) => first.to_uppercase().chain(chars).collect(),
}
})
.collect()
}

