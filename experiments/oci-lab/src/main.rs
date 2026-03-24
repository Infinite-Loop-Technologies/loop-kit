use anyhow::{Context, Result, anyhow, bail};
use clap::{Args, Parser, Subcommand};
use docker_credential::{CredentialRetrievalError, DockerCredential};
use oci_client::{
    Client, Reference, annotations,
    client::{ClientConfig, ClientProtocol, Config, ImageLayer},
    manifest,
    secrets::RegistryAuth,
};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::fs;
use tokio::process::Command;
use tokio::time::{Duration, sleep};
use tracing::{debug, warn};
use tracing_subscriber::{EnvFilter, fmt, prelude::*};
use wasmtime::{Engine, Instance, Module, Store};

const REGISTRY_NAME: &str = "loop-registry";
const REGISTRY_IMAGE: &str = "distribution/distribution:edge";
const REGISTRY_VOLUME: &str = "loop-registry-data";
const DEFAULT_REGISTRY_PORT: u16 = 5000;
const WASM_EXPORT: &str = "run";
const EXECUTABLE_LAYER_MEDIA_TYPE: &str = "application/vnd.loop.executable.v1+binary";
const BLOB_CONFIG_MEDIA_TYPE: &str = "application/vnd.oci.image.config.v1+json";

#[derive(Parser, Debug)]
#[command(author, version, about = "OCI and WASM experiment harness for the loop rewrite")]
struct Cli {
    #[arg(long, global = true)]
    insecure: bool,
    #[arg(long, global = true)]
    anonymous: bool,
    #[arg(short, long, global = true)]
    verbose: bool,
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    Registry(RegistryArgs),
    DemoWasm(DemoWasmArgs),
    PushWasm(PushWasmArgs),
    PullWasm(PullWasmArgs),
    PullRunWasm(PullRunWasmArgs),
    PushBlob(PushBlobArgs),
    PullBlob(PullBlobArgs),
    RunExecutable(RunExecutableArgs),
    RunContainer(RunContainerArgs),
}

#[derive(Args, Debug)]
struct RegistryArgs {
    #[command(subcommand)]
    command: RegistryCommand,
}

#[derive(Subcommand, Debug)]
enum RegistryCommand {
    Up(RegistryUpArgs),
    Down,
    Logs,
}

#[derive(Args, Debug)]
struct RegistryUpArgs {
    #[arg(long, default_value_t = DEFAULT_REGISTRY_PORT)]
    port: u16,
    #[arg(long)]
    ephemeral: bool,
}

#[derive(Args, Debug)]
struct DemoWasmArgs {
    #[arg(long, default_value = "tmp/demo.wasm")]
    output: PathBuf,
}

#[derive(Args, Debug)]
struct PushWasmArgs {
    #[arg(long)]
    module: PathBuf,
    #[arg(long)]
    image: String,
}

#[derive(Args, Debug)]
struct PullWasmArgs {
    #[arg(long)]
    image: String,
    #[arg(long, default_value = "tmp/pulled.wasm")]
    output: PathBuf,
}

#[derive(Args, Debug)]
struct PullRunWasmArgs {
    #[arg(long)]
    image: String,
    #[arg(long, default_value = "tmp/pulled.wasm")]
    output: PathBuf,
    #[arg(long, default_value = WASM_EXPORT)]
    export: String,
}

#[derive(Args, Debug)]
struct PushBlobArgs {
    #[arg(long)]
    file: PathBuf,
    #[arg(long)]
    image: String,
    #[arg(long, default_value = "application/octet-stream")]
    media_type: String,
}

#[derive(Args, Debug)]
struct PullBlobArgs {
    #[arg(long)]
    image: String,
    #[arg(long)]
    media_type: String,
    #[arg(long, default_value = "tmp/pulled.blob")]
    output: PathBuf,
}

#[derive(Args, Debug)]
struct RunExecutableArgs {
    #[arg(long)]
    image: String,
    #[arg(long, default_value = "tmp/pulled-executable.bin")]
    output: PathBuf,
}

#[derive(Args, Debug)]
struct RunContainerArgs {
    #[arg(long)]
    image: String,
    #[arg(last = true)]
    args: Vec<String>,
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    init_tracing(cli.verbose);

    match &cli.command {
        Commands::Registry(args) => handle_registry(args).await,
        Commands::DemoWasm(args) => demo_wasm(&args.output).await,
        Commands::PushWasm(args) => {
            let reference = parse_reference(&args.image)?;
            let auth = build_auth(&reference, cli.anonymous);
            let mut client = build_client(cli.insecure);
            push_wasm(&mut client, &auth, &reference, &args.module).await
        }
        Commands::PullWasm(args) => {
            let reference = parse_reference(&args.image)?;
            let auth = build_auth(&reference, cli.anonymous);
            let mut client = build_client(cli.insecure);
            pull_wasm(&mut client, &auth, &reference, &args.output).await
        }
        Commands::PullRunWasm(args) => {
            let reference = parse_reference(&args.image)?;
            let auth = build_auth(&reference, cli.anonymous);
            let mut client = build_client(cli.insecure);
            pull_wasm(&mut client, &auth, &reference, &args.output).await?;
            run_wasm(&args.output, &args.export)
        }
        Commands::PushBlob(args) => {
            let reference = parse_reference(&args.image)?;
            let auth = build_auth(&reference, cli.anonymous);
            let mut client = build_client(cli.insecure);
            push_blob(&mut client, &auth, &reference, &args.file, &args.media_type).await
        }
        Commands::PullBlob(args) => {
            let reference = parse_reference(&args.image)?;
            let auth = build_auth(&reference, cli.anonymous);
            let mut client = build_client(cli.insecure);
            pull_blob(
                &mut client,
                &auth,
                &reference,
                &args.media_type,
                &args.output,
            )
            .await
        }
        Commands::RunExecutable(args) => {
            let reference = parse_reference(&args.image)?;
            let auth = build_auth(&reference, cli.anonymous);
            let mut client = build_client(cli.insecure);
            pull_blob(
                &mut client,
                &auth,
                &reference,
                EXECUTABLE_LAYER_MEDIA_TYPE,
                &args.output,
            )
            .await?;
            run_executable(&args.output).await
        }
        Commands::RunContainer(args) => run_container(&args.image, &args.args).await,
    }
}

fn init_tracing(verbose: bool) {
    let filter = if verbose { "debug" } else { "info" };
    tracing_subscriber::registry()
        .with(EnvFilter::new(filter))
        .with(fmt::layer().with_writer(std::io::stderr))
        .init();
}

fn build_client(insecure: bool) -> Client {
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

fn parse_reference(image: &str) -> Result<Reference> {
    image
        .parse()
        .with_context(|| format!("invalid OCI reference: {image}"))
}

fn build_auth(reference: &Reference, anonymous: bool) -> RegistryAuth {
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

async fn handle_registry(args: &RegistryArgs) -> Result<()> {
    match &args.command {
        RegistryCommand::Up(options) => registry_up(options).await,
        RegistryCommand::Down => registry_down().await,
        RegistryCommand::Logs => docker(["logs", REGISTRY_NAME]).await.map(|_| ()),
    }
}

async fn registry_up(args: &RegistryUpArgs) -> Result<()> {
    let _ = docker(["rm", "-f", REGISTRY_NAME]).await;

    let port = format!("{}:5000", args.port);
    if args.ephemeral {
        docker([
            "run",
            "-d",
            "--rm",
            "--name",
            REGISTRY_NAME,
            "-p",
            &port,
            REGISTRY_IMAGE,
        ])
        .await?;
        println!("ephemeral OCI registry is running on localhost:{}", args.port);
        return Ok(());
    }

    docker(["volume", "create", REGISTRY_VOLUME]).await?;
    let volume = format!("{REGISTRY_VOLUME}:/var/lib/registry");
    docker([
        "run",
        "-d",
        "--name",
        REGISTRY_NAME,
        "-p",
        &port,
        "-v",
        &volume,
        REGISTRY_IMAGE,
    ])
    .await?;
    println!(
        "persistent OCI registry is running on localhost:{} with volume {}",
        args.port, REGISTRY_VOLUME
    );
    Ok(())
}

async fn registry_down() -> Result<()> {
    docker(["rm", "-f", REGISTRY_NAME]).await?;
    println!("registry stopped");
    Ok(())
}

async fn demo_wasm(output: &Path) -> Result<()> {
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
    println!("demo wasm written to {}", output.display());
    Ok(())
}

async fn push_wasm(
    client: &mut Client,
    auth: &RegistryAuth,
    reference: &Reference,
    module_path: &Path,
) -> Result<()> {
    let data = fs::read(module_path)
        .await
        .with_context(|| format!("failed to read wasm module {}", module_path.display()))?;

    let mut annotations = BTreeMap::new();
    annotations.insert(
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
    let image_manifest = manifest::OciImageManifest::build(&layers, &config, Some(annotations));

    let response = client
        .push(reference, &layers, config, auth, Some(image_manifest))
        .await?;
    println!("pushed wasm artifact to {}", response.manifest_url);
    Ok(())
}

async fn pull_wasm(
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
    println!("pulled wasm artifact to {}", output.display());
    Ok(())
}

async fn push_blob(
    client: &mut Client,
    auth: &RegistryAuth,
    reference: &Reference,
    file: &Path,
    media_type: &str,
) -> Result<()> {
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
    println!("pushed blob artifact to {}", response.manifest_url);
    Ok(())
}

async fn pull_blob(
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
    println!("pulled blob artifact to {}", output.display());
    Ok(())
}

fn run_wasm(module_path: &Path, export_name: &str) -> Result<()> {
    let engine = Engine::default();
    let module = Module::from_file(&engine, module_path)
        .with_context(|| format!("failed to load wasm module {}", module_path.display()))?;
    let mut store = Store::new(&engine, ());
    let instance = Instance::new(&mut store, &module, &[])?;
    let function = instance
        .get_typed_func::<(), i32>(&mut store, export_name)
        .with_context(|| format!("failed to find i32 -> () export `{export_name}`"))?;
    let result = function.call(&mut store, ())?;
    println!("wasm export `{export_name}` returned {result}");
    Ok(())
}

async fn run_executable(path: &Path) -> Result<()> {
    if cfg!(windows) {
        let status = Command::new(path)
            .stdin(Stdio::null())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .status()
            .await?;
        if !status.success() {
            bail!("executable exited with status {status}");
        }
        return Ok(());
    }

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        let metadata = std::fs::metadata(path)?;
        let mut permissions = metadata.permissions();
        permissions.set_mode(0o755);
        std::fs::set_permissions(path, permissions)?;
    }

    let status = Command::new(path)
        .stdin(Stdio::null())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()
        .await?;
    if !status.success() {
        bail!("executable exited with status {status}");
    }
    Ok(())
}

async fn run_container(image: &str, args: &[String]) -> Result<()> {
    let mut command = Command::new("docker");
    command.arg("run").arg("--rm").arg(image);
    command.args(args);
    command.stdin(Stdio::null());
    command.stdout(Stdio::inherit());
    command.stderr(Stdio::inherit());

    let status = command.status().await?;
    if !status.success() {
        bail!("container exited with status {status}");
    }
    Ok(())
}

async fn write_file(path: &Path, contents: &[u8]) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).await?;
    }
    fs::write(path, contents).await?;
    Ok(())
}

async fn docker<const N: usize>(args: [&str; N]) -> Result<String> {
    let output = Command::new("docker").args(args).output().await?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        bail!("docker {} failed: {}", args.join(" "), stderr.trim());
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}
