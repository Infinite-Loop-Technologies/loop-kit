// crates/loop-cli/src/commands/check.rs
use anyhow::Result;
use console::style;

use super::{command_exists, print_error, print_info, print_success};

pub fn execute() -> Result<()> {
    println!("{}", style("Loop-Kit Environment Check").bold());
    println!();

    let mut all_ok = true;

    // Check Rust
    print_info("Checking Rust toolchain...");
    if command_exists("rustc") {
        let output = std::process::Command::new("rustc")
            .arg("--version")
            .output()?;
        let version = String::from_utf8_lossy(&output.stdout);
        print_success(&format!("rustc: {}", version.trim()));
    } else {
        print_error("rustc not found");
        all_ok = false;
    }

    // Check wasm32-wasip2 target
    print_info("Checking WASM target...");
    let output = std::process::Command::new("rustup")
        .args(["target", "list", "--installed"])
        .output();

    if let Ok(output) = output {
        let targets = String::from_utf8_lossy(&output.stdout);
        if targets.contains("wasm32-wasip2") {
            print_success("wasm32-wasip2 target installed");
        } else {
            print_error("wasm32-wasip2 target not installed");
            println!("  Run: rustup target add wasm32-wasip2");
            all_ok = false;
        }
    }

    // Check wit-deps
    print_info("Checking wit-deps...");
    if command_exists("wit-deps") {
        print_success("wit-deps installed");
    } else {
        print_error("wit-deps not found");
        println!("  Run: cargo install wit-deps-cli");
        all_ok = false;
    }

    println!();
    if all_ok {
        print_success("All checks passed!");
    } else {
        print_error("Some checks failed");
    }

    Ok(())
}
