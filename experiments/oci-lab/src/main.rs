use anyhow::Result;
use clap::{Args, Parser, Subcommand};
use oci_lab::{
    DEFAULT_REGISTRY_NAME, DEFAULT_REGISTRY_PORT, EXECUTABLE_LAYER_MEDIA_TYPE, WASM_EXPORT,
    build_auth, build_client, demo_wasm, init_tracing, parse_reference, pull_blob, pull_wasm,
    push_blob, push_wasm, registry_down_default, registry_logs, registry_up_default,
    run_container, run_executable, run_wasm,
};
use std::path::PathBuf;

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
        Commands::DemoWasm(args) => {
            demo_wasm(&args.output).await?;
            println!("demo wasm written to {}", args.output.display());
            Ok(())
        }
        Commands::PushWasm(args) => {
            let reference = parse_reference(&args.image)?;
            let auth = build_auth(&reference, cli.anonymous);
            let mut client = build_client(cli.insecure);
            let url = push_wasm(&mut client, &auth, &reference, &args.module).await?;
            println!("pushed wasm artifact to {url}");
            Ok(())
        }
        Commands::PullWasm(args) => {
            let reference = parse_reference(&args.image)?;
            let auth = build_auth(&reference, cli.anonymous);
            let mut client = build_client(cli.insecure);
            pull_wasm(&mut client, &auth, &reference, &args.output).await?;
            println!("pulled wasm artifact to {}", args.output.display());
            Ok(())
        }
        Commands::PullRunWasm(args) => {
            let reference = parse_reference(&args.image)?;
            let auth = build_auth(&reference, cli.anonymous);
            let mut client = build_client(cli.insecure);
            pull_wasm(&mut client, &auth, &reference, &args.output).await?;
            println!("pulled wasm artifact to {}", args.output.display());
            let result = run_wasm(&args.output, &args.export)?;
            println!("wasm export `{}` returned {result}", args.export);
            Ok(())
        }
        Commands::PushBlob(args) => {
            let reference = parse_reference(&args.image)?;
            let auth = build_auth(&reference, cli.anonymous);
            let mut client = build_client(cli.insecure);
            let url = push_blob(&mut client, &auth, &reference, &args.file, &args.media_type).await?;
            println!("pushed blob artifact to {url}");
            Ok(())
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
            .await?;
            println!("pulled blob artifact to {}", args.output.display());
            Ok(())
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
            println!("pulled blob artifact to {}", args.output.display());
            let output = run_executable(&args.output).await?;
            if !output.is_empty() {
                print!("{output}");
            }
            Ok(())
        }
        Commands::RunContainer(args) => {
            let output = run_container(&args.image, &args.args).await?;
            if !output.is_empty() {
                print!("{output}");
            }
            Ok(())
        }
    }
}

async fn handle_registry(args: &RegistryArgs) -> Result<()> {
    match &args.command {
        RegistryCommand::Up(options) => {
            if options.port != DEFAULT_REGISTRY_PORT {
                anyhow::bail!("the CLI currently reserves custom-port registries for tests; use the library helpers for non-default ports");
            }

            let registry = registry_up_default(options.ephemeral).await?;
            if options.ephemeral {
                println!("ephemeral OCI registry is running on localhost:{}", registry.port);
            } else {
                println!(
                    "persistent OCI registry is running on localhost:{} with volume loop-registry-data",
                    registry.port
                );
            }
            Ok(())
        }
        RegistryCommand::Down => {
            registry_down_default().await?;
            println!("registry stopped");
            Ok(())
        }
        RegistryCommand::Logs => {
            let logs = registry_logs(DEFAULT_REGISTRY_NAME).await?;
            if !logs.is_empty() {
                println!("{logs}");
            }
            Ok(())
        }
    }
}
