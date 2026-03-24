use anyhow::Result;
use oci_lab::{
    EXECUTABLE_LAYER_MEDIA_TYPE, WASM_EXPORT, build_client, demo_wasm, parse_reference,
    pick_free_port, pull_blob, pull_wasm, push_blob, push_wasm, registry_up_named,
    run_container, run_executable, run_wasm, unique_registry_name,
};
use std::path::{Path, PathBuf};
use tempfile::TempDir;

struct RegistryGuard {
    name: String,
}

impl RegistryGuard {
    fn new(name: String) -> Self {
        Self { name }
    }
}

impl Drop for RegistryGuard {
    fn drop(&mut self) {
        let _ = std::process::Command::new("docker")
            .args(["rm", "-f", &self.name])
            .output();
    }
}

#[tokio::test]
async fn wasm_roundtrip_works_against_ephemeral_registry() -> Result<()> {
    let port = pick_free_port()?;
    let name = unique_registry_name("oci-lab-test", port);
    let _guard = RegistryGuard::new(name.clone());
    let registry = registry_up_named(&name, port, true).await?;

    let temp = TempDir::new()?;
    let source = temp.path().join("demo.wasm");
    let pulled = temp.path().join("pulled.wasm");
    demo_wasm(&source).await?;

    let reference = parse_reference(&format!("{}/loop/hello-wasm:test", registry.base_url()))?;
    let mut client = build_client(true);
    let auth = oci_client::secrets::RegistryAuth::Anonymous;

    push_wasm(&mut client, &auth, &reference, &source).await?;
    pull_wasm(&mut client, &auth, &reference, &pulled).await?;

    let result = run_wasm(&pulled, WASM_EXPORT)?;
    assert_eq!(result, 7);

    registry.stop().await?;
    Ok(())
}

#[tokio::test]
async fn executable_blob_roundtrip_works_against_ephemeral_registry() -> Result<()> {
    let port = pick_free_port()?;
    let name = unique_registry_name("oci-lab-test", port);
    let _guard = RegistryGuard::new(name.clone());
    let registry = registry_up_named(&name, port, true).await?;

    let temp = TempDir::new()?;
    let source = executable_fixture(temp.path())?;
    let pulled = pulled_executable_path(temp.path());

    let reference = parse_reference(&format!("{}/loop/hello-exec:test", registry.base_url()))?;
    let mut client = build_client(true);
    let auth = oci_client::secrets::RegistryAuth::Anonymous;

    push_blob(
        &mut client,
        &auth,
        &reference,
        &source,
        EXECUTABLE_LAYER_MEDIA_TYPE,
    )
    .await?;
    pull_blob(
        &mut client,
        &auth,
        &reference,
        EXECUTABLE_LAYER_MEDIA_TYPE,
        &pulled,
    )
    .await?;

    let output = run_executable(&pulled).await?;
    assert!(output.contains("executable-ok"));

    registry.stop().await?;
    Ok(())
}

#[tokio::test]
async fn container_dispatch_runs_real_container() -> Result<()> {
    let output = run_container("hello-world", &[]).await?;
    assert!(output.contains("Hello from Docker!"));
    Ok(())
}

fn executable_fixture(root: &Path) -> Result<PathBuf> {
    #[cfg(windows)]
    let path = root.join("echo.cmd");
    #[cfg(not(windows))]
    let path = root.join("echo.sh");

    #[cfg(windows)]
    std::fs::write(&path, "@echo off\r\necho executable-ok\r\n")?;
    #[cfg(not(windows))]
    std::fs::write(&path, "#!/usr/bin/env sh\necho executable-ok\n")?;

    Ok(path)
}

fn pulled_executable_path(root: &Path) -> PathBuf {
    #[cfg(windows)]
    {
        root.join("pulled.cmd")
    }

    #[cfg(not(windows))]
    {
        root.join("pulled.sh")
    }
}
