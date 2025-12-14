pub fn cargo_toml(name: &str) -> String {
    format!(
        r#"[package]
name = "{}"
version = "0.1.0"
edition = "2021"

[dependencies]
wit-bindgen = "0.19"

[lib]
crate-type = ["cdylib"]

[profile.release]
opt-level = "s"
lto = true
"#,
        name
    )
}

pub fn lib_rs() -> &'static str {
    r#"// Auto-generated bindings from WIT
wit_bindgen::generate!({
    world: "loop-world",
    exports: {
        world: Component,
    },
});

struct Component;

impl Guest for Component {
    fn run() {
        println!("Hello from loop component!");
        
        // Example: Create a window
        // let config = WindowConfig {
        //     title: "My App".to_string(),
        //     width: 800,
        //     height: 600,
        // };
        // let window_id = create_window(&config);
    }
}
"#
}

pub fn world_wit(name: &str) -> String {
    format!(
        r#"package {}:component;

world loop-world {{
    import loop:window/window;
    
    export run: func();
}}
"#,
        name
    )
}

pub fn cargo_config() -> &'static str {
    r#"[build]
target = "wasm32-wasi"
"#
}
pub fn readme(name: &str) -> String {
    format!(
        "# {name}

A loop-kit component.

Building

loop build

Running

loop run

Development

loop dev

This will watch for changes and rebuild automatically.

Usage examples

Create a new project:
loop new my-app

Navigate to it:
cd my-app

Build the component:
loop build

Run it:
loop run

Develop with auto-rebuild:
loop dev
",
        name = name
    )
}
