import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const workspaceRoot = resolve(import.meta.dir, "..");
const daemonDir = resolve(workspaceRoot, ".volt", "daemon");
const statePath = resolve(daemonDir, "workspace.json");
const logPath = resolve(daemonDir, "workspace.log");

const readStream = async (stream: ReadableStream<Uint8Array> | undefined) =>
  stream ? new Response(stream).text() : "";

const readJsonFile = async (path: string) => {
  if (!existsSync(path)) {
    return undefined;
  }

  return JSON.parse(await readFile(path, "utf8")) as unknown;
};

const readLogFile = async () => {
  if (!existsSync(logPath)) {
    return [] as string[];
  }

  return (await readFile(logPath, "utf8"))
    .split(/\r?\n/u)
    .filter(Boolean);
};

const runVoltCommand = async (args: string[]) => {
  const child = Bun.spawn({
    cmd: ["bun", "run", "packages/volt/src/cli.ts", ...args],
    cwd: workspaceRoot,
    stderr: "pipe",
    stdout: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    readStream(child.stdout),
    readStream(child.stderr),
    child.exited,
  ]);

  return {
    exitCode,
    stderr: stderr.trim(),
    stdout: stdout.trim(),
  };
};

if (Bun.argv.includes("--probe")) {
  console.log("volt-mcp probe ok");
} else {
  const server = new McpServer({
    name: "volt-workspace",
    version: "0.0.1",
  });

  server.registerTool(
    "workspace_status",
    {
      description: "Read the current Volt workspace daemon status JSON.",
      title: "Workspace Status",
    },
    async () => {
      const state = await readJsonFile(statePath);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                state,
                workspaceRoot,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "recent_logs",
    {
      description: "Read recent lines from the Volt workspace daemon log.",
      inputSchema: {
        limit: z.number().int().positive().max(400).optional(),
      },
      title: "Recent Logs",
    },
    async ({ limit = 60 }) => {
      const lines = await readLogFile();
      return {
        content: [
          {
            type: "text",
            text: lines.slice(-Number(limit)).join("\n"),
          },
        ],
      };
    },
  );

  server.registerTool(
    "run_task",
    {
      description:
        "Run a Volt workspace task for a project and return stdout, stderr, and exit code.",
      inputSchema: {
        mode: z.enum(["development", "production"]).optional(),
        project: z.string().min(1),
        task: z.string().min(1),
      },
      title: "Run Task",
    },
    async ({ mode = "development", project, task }) => {
      const result = await runVoltCommand([
        "task",
        "run",
        project,
        task,
        "--mode",
        mode,
      ]);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "daemon_stop",
    {
      description: "Stop the Volt workspace daemon for this repo.",
      title: "Daemon Stop",
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(await runVoltCommand(["daemon", "stop"]), null, 2),
        },
      ],
    }),
  );

  server.registerTool(
    "daemon_restart",
    {
      description: "Restart the Volt workspace daemon for this repo.",
      title: "Daemon Restart",
    },
    async () => {
      const stopResult = await runVoltCommand(["daemon", "stop"]);
      const startResult = await runVoltCommand(["daemon", "start"]);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ startResult, stopResult }, null, 2),
          },
        ],
      };
    },
  );

  await server.connect(new StdioServerTransport());
}
