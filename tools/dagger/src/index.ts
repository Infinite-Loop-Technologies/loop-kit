import { Container, Directory, dag, func, object } from "@dagger.io/dagger";

const NODE_IMAGE = "node:22-bookworm";
const PNPM_VERSION = "10.15.1";
const DOTENVX_VERSION = "1.53.0";
const NITRIC_VERSION = "1.61.1";
const REGISTRY_APP_PATH = "/workspace/examples/nitric/loop-registry";

@object()
export class Loopkit {
  private workspaceDirectory(): Directory {
    return dag.env({ privileged: true }).workspace();
  }

  private nodeContainer(): Container {
    return dag
      .container()
      .from(NODE_IMAGE)
      .withMountedDirectory("/workspace", this.workspaceDirectory())
      .withWorkdir("/workspace")
      .withExec(["corepack", "enable"])
      .withExec(["corepack", "prepare", `pnpm@${PNPM_VERSION}`, "--activate"]);
  }

  private withInstall(container: Container): Container {
    return container.withExec(["pnpm", "install", "--frozen-lockfile"]);
  }

  private withLoopCliRuntime(container: Container): Container {
    return this.withInstall(container).withExec([
      "pnpm",
      "--filter",
      "@loop-kit/loop-cli",
      "build",
    ]);
  }

  private withCiChecks(container: Container, includeSmoke = true): Container {
    let next = container;
    if (includeSmoke) {
      next = next.withExec(["pnpm", "run", "loop:smoke", "--", "--cwd", "."]);
    }

    return next.withExec(["pnpm", "run", "loop:dev", "ci", "--cwd", "."]);
  }

  private withNitricTooling(container: Container): Container {
    return container
      .withExec(["apt-get", "update"])
      .withExec([
        "apt-get",
        "install",
        "-y",
        "--no-install-recommends",
        "ca-certificates",
        "curl",
        "git",
      ])
      .withExec([
        "bash",
        "-lc",
        [
          "set -euo pipefail",
          `curl -fsSL -o /tmp/dotenvx.tar.gz https://github.com/dotenvx/dotenvx/releases/download/v${DOTENVX_VERSION}/dotenvx-${DOTENVX_VERSION}-linux-amd64.tar.gz`,
          "tar -xzf /tmp/dotenvx.tar.gz -C /usr/local/bin dotenvx",
          `curl -fsSL -o /tmp/nitric.tar.gz https://github.com/nitrictech/cli/releases/download/v${NITRIC_VERSION}/nitric_${NITRIC_VERSION}_Linux_x86_64.tar.gz`,
          "tar -xzf /tmp/nitric.tar.gz -C /usr/local/bin nitric",
          "chmod +x /usr/local/bin/dotenvx /usr/local/bin/nitric",
        ].join(" && "),
      ]);
  }

  private shellQuote(value: string): string {
    return `'${value.replace(/'/g, `'\"'\"'`)}'`;
  }

  @func()
  async ci(): Promise<string> {
    return this.withCiChecks(this.withLoopCliRuntime(this.nodeContainer())).stdout();
  }

  @func()
  async build(): Promise<string> {
    return this.withLoopCliRuntime(this.nodeContainer())
      .withExec(["pnpm", "run", "loop:dev", "run", "build", "--cwd", "."])
      .stdout();
  }

  @func()
  async typecheck(): Promise<string> {
    return this.withLoopCliRuntime(this.nodeContainer())
      .withExec(["pnpm", "run", "loop:dev", "run", "typecheck", "--cwd", "."])
      .stdout();
  }

  @func()
  async test(): Promise<string> {
    return this.withLoopCliRuntime(this.nodeContainer())
      .withExec(["pnpm", "run", "loop:dev", "run", "test", "--cwd", "."])
      .stdout();
  }

  @func()
  async publishPackages(
    tag = "latest",
    dryRun = true,
    skipChecks = false,
    npmToken = "",
  ): Promise<string> {
    if (!dryRun && !npmToken) {
      throw new Error("`npmToken` is required when `dryRun` is false.");
    }

    const args = ["node", "tools/release/publish-all.mjs"];
    if (dryRun) {
      args.push("--dry-run");
    }
    args.push("--skip-checks");
    if (tag) {
      args.push("--tag", tag);
    }

    let container = this.withLoopCliRuntime(this.nodeContainer());
    if (!skipChecks) {
      container = this.withCiChecks(container);
    }
    if (npmToken) {
      container = container.withEnvVariable("NODE_AUTH_TOKEN", npmToken);
    }

    return container.withExec(args).stdout();
  }

  @func()
  async publishCliStack(
    tag = "latest",
    dryRun = true,
    skipChecks = false,
    npmToken = "",
  ): Promise<string> {
    if (!dryRun && !npmToken) {
      throw new Error("`npmToken` is required when `dryRun` is false.");
    }

    const args = ["node", "tools/release/publish-loop-cli-stack.mjs"];
    if (dryRun) {
      args.push("--dry-run");
    }
    args.push("--skip-checks");
    if (tag) {
      args.push("--tag", tag);
    }

    let container = this.withLoopCliRuntime(this.nodeContainer());
    if (!skipChecks) {
      container = this.withCiChecks(container);
    }
    if (npmToken) {
      container = container.withEnvVariable("NODE_AUTH_TOKEN", npmToken);
    }

    return container.withExec(args).stdout();
  }

  private registryContainer(): Container {
    return this.withNitricTooling(this.nodeContainer())
      .withWorkdir(REGISTRY_APP_PATH)
      .withExec(["npm", "install"]);
  }

  @func()
  async registrySpec(envFile = ".env.registry"): Promise<string> {
    return this.registryContainer()
      .withExec([
        "bash",
        "-lc",
        `dotenvx run --env-file ${this.shellQuote(envFile)} -- nitric spec`,
      ])
      .stdout();
  }

  @func()
  async registryBuild(envFile = ".env.registry"): Promise<string> {
    return this.registryContainer()
      .withExec([
        "bash",
        "-lc",
        `dotenvx run --env-file ${this.shellQuote(envFile)} -- nitric build --ci`,
      ])
      .stdout();
  }

  @func()
  async registryDeploy(stack = "gcp-main", envFile = ".env.registry"): Promise<string> {
    return this.registryContainer()
      .withExec([
        "bash",
        "-lc",
        `dotenvx run --env-file ${this.shellQuote(envFile)} -- nitric up -s ${this.shellQuote(stack)} --ci`,
      ])
      .stdout();
  }
}
