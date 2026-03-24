use anyhow::{Context, Result, anyhow, bail};
use docker_credential::{CredentialRetrievalError, DockerCredential};
use oci_client::{
    Client, Reference, annotations,
    client::{ClientConfig, ClientProtocol, Config, ImageLayer},
    manifest,
    secrets::RegistryAuth,
};
use std::collections::BTreeMap;
use std::net::TcpListener;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::fs;
use tokio::process::Command;
use tokio::time::{Duration, sleep};
use tracing::{debug, warn};
use wasmtime::{Engine, Instance, Module, Store};

pub const DEFAULT_REGISTRY_NAME: &str = "loop-registry";
pub const REGISTRY_IMAGE: &str = "distribution/distribution:edge";
pub const REGISTRY_VOLUME: &str = "loop-registry-data";
pub const DEFAULT_REGISTRY_PORT: u16 = 5000;
pub const WASM_EXPORT: &str = "run";
pub const EXECUTABLE_LAYER_MEDIA_TYPE: &str = "application/vnd.loop.executable.v1+binary";
pub const BLOB_CONFIG_MEDIA_TYPE: &str = "application/vnd.oci.image.config.v1+json";

pub struct RegistryInstance {
    name: String,
    pub port: u16,
}

impl RegistryInstance {
    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn base_url(&self) -> String {
        format!("localhost:{}", self.port)
    }

    pub async fn stop(&self) -> Result<()> {
        registry_down_named(&self.name).await
    }
}

pub async fn registry_up_default(ephemeral: bool) -> Result<RegistryInstance> {
    registry_up_named(DEFAULT_REGISTRY_NAME, DEFAULT_REGISTRY_PORT, ephemeral).await
}

pub async fn registry_up_named(name: &str, port: u16, ephemeral: bool) -> Result<RegistryInstance> {
    let _ = docker(vec!["rm".into(), "-f".into(), name.into()]).await;

    let mut args = vec![
        "run".into(),
        "-d".into(),
        "--name".into(),
        name.into(),
        "-p".into(),
        format!("{port}:5000"),
    ];

    if ephemeral {
        args.insert(2, "--rm".into());
    } else {
        docker(vec!["volume".into(), "create".into(), REGISTRY_VOLUME.into()]).await?;
        args.push("-v".into());
        args.push(format!("{REGISTRY_VOLUME}:/var/lib/registry"));
    }

    args.push(REGISTRY_IMAGE.into());
    docker(args).await?;

    Ok(RegistryInstance {
        name: name.to_string(),
        port,
    })
}

pub async fn registry_down_default() -> Result<()> {
    registry_down_named(DEFAULT_REGISTRY_NAME).await
}

pub async fn registry_down_named(name: &str) -> Result<()> {
    docker(vec!["rm".into(), "-f".into(), name.into()]).await?;
    Ok(())
}

pub async fn registry_logs(name: &str) -> Result<String> {
    docker(vec!["logs".into(), name.into()]).await
}

pub fn init_tracing(verbose: bool) {
    let filter = if verbose { "debug" } else { "info" };
    let _ = tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_writer(std::io::stderr)
        .try_init();
}

pub fn build_client(insecure: bool) -> Client {
    let protocol = if insecure {
        ClientProtocol::Http
    } else {
        ClientProtocol::Https
    };

    Client::new(ClientConfig {
        protocol,
        ..Default::default()
    })
}

pub fn parse_reference(image: &str) -> Result<Reference> {
    image
        .parse()
        .with_context(|| format!("invalid OCI reference: {image}"))
}

pub fn build_auth(reference: &Reference, anonymous: bool) -> RegistryAuth {
    if anonymous {
        return RegistryAuth::Anonymous;
    }

    let server = reference
        .resolve_registry()
        .strip_suffix('/')
        .unwrap_or_else(|| reference.resolve_registry());

    match docker_credential::get_credential(server) {
        Err(CredentialRetrievalError::ConfigNotFound) => RegistryAuth::Anonymous,
        Err(CredentialRetrievalError::NoCredentialConfigured) => RegistryAuth::Anonymous,
        Err(error) => {
            warn!(?error, "failed to load docker credentials, falling back to anonymous auth");
            RegistryAuth::Anonymous
        }
        Ok(DockerCredential::UsernamePassword(username, password)) => {
            debug!("using docker credential helper auth");
            RegistryAuth::Basic(username, password)
        }
        Ok(DockerCredential::IdentityToken(_)) => {
            warn!("identity tokens are not supported here, falling back to anonymous auth");
            RegistryAuth::Anonymous
        }
    }
}

pub async fn demo_wasm(output: &Path) -> Result<()> {
    if let Some(parent) = output.parent() {
        fs::create_dir_all(parent).await?;
    }

    let bytes = wat::parse_str(
        r#"
        (module
          (func (export "run") (result i32)
            i32.const 7))
        "#,
    )?;
    fs::write(output, bytes).await?;
    Ok(())
}

pub async fn push_wasm(
    client: &mut Client,
    auth: &RegistryAuth,
    reference: &Reference,
    module_path: &Path,
) -> Result<String> {
    let data = fs::read(module_path)
        .await
        .with_context(|| format!("failed to read wasm module {}", module_path.display()))?;

    let mut annotations_map = BTreeMap::new();
    annotations_map.insert(
        annotations::ORG_OPENCONTAINERS_IMAGE_TITLE.to_string(),
        module_path
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or("module.wasm")
            .to_string(),
    );

    let layers = vec![ImageLayer::new(
        data,
        manifest::WASM_LAYER_MEDIA_TYPE.to_string(),
        None,
    )];
    let config = Config {
        data: bytes::Bytes::from_static(b"{}"),
        media_type: manifest::WASM_CONFIG_MEDIA_TYPE.to_string(),
        annotations: None,
    };
    let image_manifest =
        manifest::OciImageManifest::build(&layers, &config, Some(annotations_map));

    let response = client
        .push(reference, &layers, config, auth, Some(image_manifest))
        .await?;
    Ok(response.manifest_url)
}

pub async fn pull_wasm(
    client: &mut Client,
    auth: &RegistryAuth,
    reference: &Reference,
    output: &Path,
) -> Result<()> {
    let mut last_error = None;
    let mut image = None;

    for _attempt in 0..5 {
        match client
            .pull(reference, auth, vec![manifest::WASM_LAYER_MEDIA_TYPE])
            .await
        {
            Ok(result) => {
                image = Some(result);
                break;
            }
            Err(error) => {
                last_error = Some(error);
                sleep(Duration::from_millis(250)).await;
            }
        }
    }

    let image = image.ok_or_else(|| {
        anyhow!(
            "failed to pull wasm artifact after retries: {}",
            last_error
                .map(|error| error.to_string())
                .unwrap_or_else(|| "unknown pull error".to_string())
        )
    })?;
    let layer = image
        .layers
        .into_iter()
        .next()
        .ok_or_else(|| anyhow!("registry response contained no wasm layer"))?;
    write_file(output, &layer.data).await?;
    Ok(())
}

pub async fn push_blob(
    client: &mut Client,
    auth: &RegistryAuth,
    reference: &Reference,
    file: &Path,
    media_type: &str,
) -> Result<String> {
    let data = fs::read(file)
        .await
        .with_context(|| format!("failed to read blob {}", file.display()))?;

    let layer = ImageLayer::new(data, media_type.to_string(), None);
    let config = Config::new(
        bytes::Bytes::from_static(b"{}"),
        BLOB_CONFIG_MEDIA_TYPE.to_string(),
        None,
    );
    let image_manifest = manifest::OciImageManifest::build(&[layer.clone()], &config, None);

    let response = client
        .push(reference, &[layer], config, auth, Some(image_manifest))
        .await?;
    Ok(response.manifest_url)
}

pub async fn pull_blob(
    client: &mut Client,
    auth: &RegistryAuth,
    reference: &Reference,
    media_type: &str,
    output: &Path,
) -> Result<()> {
    let image = client.pull(reference, auth, vec![media_type]).await?;
    let layer = image
        .layers
        .into_iter()
        .next()
        .ok_or_else(|| anyhow!("registry response contained no matching blob layer"))?;
    write_file(output, &layer.data).await?;
    Ok(())
}

pub fn run_wasm(module_path: &Path, export_name: &str) -> Result<i32> {
    let engine = Engine::default();
    let module = Module::from_file(&engine, module_path)
        .with_context(|| format!("failed to load wasm module {}", module_path.display()))?;
    let mut store = Store::new(&engine, ());
    let instance = Instance::new(&mut store, &module, &[])?;
    let function = instance
        .get_typed_func::<(), i32>(&mut store, export_name)
        .with_context(|| format!("failed to find i32 -> () export `{export_name}`"))?;
    function.call(&mut store, ()).map_err(Into::into)
}

pub async fn run_executable(path: &Path) -> Result<String> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        let metadata = std::fs::metadata(path)?;
        let mut permissions = metadata.permissions();
        permissions.set_mode(0o755);
        std::fs::set_permissions(path, permissions)?;
    }

    let output = Command::new(path)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        bail!("executable exited with status {}: {}", output.status, stderr.trim());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub async fn run_container(image: &str, args: &[String]) -> Result<String> {
    let mut command = Command::new("docker");
    command.arg("run").arg("--rm").arg(image);
    command.args(args);
    command.stdin(Stdio::null());
    command.stdout(Stdio::piped());
    command.stderr(Stdio::piped());

    let output = command.output().await?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        bail!("container exited with status {}: {}", output.status, stderr.trim());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub async fn write_file(path: &Path, contents: &[u8]) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).await?;
    }
    fs::write(path, contents).await?;
    Ok(())
}

pub fn pick_free_port() -> Result<u16> {
    let listener = TcpListener::bind("127.0.0.1:0")?;
    Ok(listener.local_addr()?.port())
}

pub fn unique_registry_name(prefix: &str, port: u16) -> String {
    format!("{prefix}-{port}")
}

async fn docker(args: Vec<String>) -> Result<String> {
    let output = Command::new("docker").args(&args).output().await?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        bail!("docker {} failed: {}", args.join(" "), stderr.trim());
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

pub fn default_demo_wasm_path() -> PathBuf {
    PathBuf::from("tmp/demo.wasm")
}
