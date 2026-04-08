import type { ShareProvider } from "./share-provider";

const run = async (args: string[]) => {
  const child = Bun.spawn({
    cmd: ["bunx", ...args],
    stderr: "pipe",
    stdout: "pipe",
  });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);

  if (code !== 0) {
    throw new Error(stderr || stdout || `Command failed: bunx ${args.join(" ")}`);
  }

  return stdout.trim();
};

export const createPortlessShareProvider = (): ShareProvider => ({
  name: "portless",
  async publish(serviceName, port) {
    try {
      await run(["portless", "alias", serviceName, String(port), "--force"]);
      return await run(["portless", "get", serviceName]);
    } catch {
      return null;
    }
  },
});
