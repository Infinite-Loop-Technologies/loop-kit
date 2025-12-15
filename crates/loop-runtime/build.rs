// crates/loop-runtime/build.rs
fn main() {
    // Ensure wit directory changes trigger rebuild
    println!("cargo::rerun-if-changed=../../wit");
}
