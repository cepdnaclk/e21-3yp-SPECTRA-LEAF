import { spawn } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const host = process.env.HOST ?? "127.0.0.1";
const preferredPort = Number.parseInt(process.env.PORT ?? "3200", 10);
const portAttempts = 20;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const nextBin = path.resolve(scriptDir, "../node_modules/next/dist/bin/next");

if (!Number.isInteger(preferredPort) || preferredPort < 1 || preferredPort > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

function isPortFree(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE" || error.code === "EACCES") {
        resolve(false);
        return;
      }
      reject(error);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

async function findPort() {
  for (let port = preferredPort; port < preferredPort + portAttempts; port += 1) {
    if (await isPortFree(port)) return port;
  }

  throw new Error(
    `No free localhost port found from ${preferredPort} to ${preferredPort + portAttempts - 1}.`,
  );
}

const port = await findPort();

if (port !== preferredPort) {
  console.warn(`Port ${preferredPort} is unavailable; starting dev server on ${port}.`);
}

const child = spawn(
  process.execPath,
  [nextBin, "dev", "--hostname", host, "--port", String(port)],
  {
    env: { ...process.env, PORT: String(port) },
    stdio: "inherit",
  },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
