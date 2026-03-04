use anyhow::Result;

#[cfg(windows)]
use serde_json::{json, Value};
#[cfg(windows)]
use tokio::{
    io::{AsyncBufReadExt, AsyncWriteExt, BufReader},
    net::windows::named_pipe::{NamedPipeServer, ServerOptions},
};

#[cfg(windows)]
const DEFAULT_PIPE_NAME: &str = r"\\.\pipe\loop-kit-host-shell";

#[cfg(windows)]
async fn handle_connection(pipe: NamedPipeServer) -> Result<()> {
    let mut reader = BufReader::new(pipe);
    let mut line = String::new();
    let read = reader.read_line(&mut line).await?;
    if read == 0 {
        return Ok(());
    }

    let request: Value = serde_json::from_str(line.trim())?;
    let request_id = request
        .get("id")
        .and_then(Value::as_str)
        .unwrap_or("unknown")
        .to_string();
    let method = request
        .get("method")
        .and_then(Value::as_str)
        .unwrap_or("unknown");

    let response = if method == "host.ping" {
        json!({
            "version": "1",
            "type": "result",
            "id": request_id,
            "result": {
                "message": "pong",
                "host": "loop-kit-host-shell"
            }
        })
    } else {
        json!({
            "version": "1",
            "type": "result",
            "id": request_id,
            "error": {
                "code": "method.not_found",
                "message": format!("Unsupported method: {method}")
            }
        })
    };

    let mut pipe = reader.into_inner();
    pipe.write_all(response.to_string().as_bytes()).await?;
    pipe.write_all(b"\n").await?;
    pipe.flush().await?;
    Ok(())
}

#[cfg(windows)]
#[tokio::main]
async fn main() -> Result<()> {
    let pipe_name = std::env::var("LOOP_HOST_SHELL_PIPE").unwrap_or_else(|_| DEFAULT_PIPE_NAME.to_string());
    let mut first = true;
    println!("host-shell listening on {}", pipe_name);

    loop {
        let mut options = ServerOptions::new();
        if first {
            options.first_pipe_instance(true);
            first = false;
        }

        let server = options.create(&pipe_name)?;
        server.connect().await?;

        tokio::spawn(async move {
            if let Err(error) = handle_connection(server).await {
                eprintln!("host-shell connection error: {error}");
            }
        });
    }
}

#[cfg(not(windows))]
fn main() {
    println!("host-shell currently supports Windows named pipes only.");
}
