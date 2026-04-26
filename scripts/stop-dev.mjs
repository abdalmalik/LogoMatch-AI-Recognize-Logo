import { existsSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pidPath = path.join(rootDir, ".dev.pid");
const logPath = path.join(rootDir, "tmp-dev.log");

if (!existsSync(pidPath)) {
  console.log("No background dev server pid file was found.");
  console.log("If you started dev in a VS Code terminal, press Ctrl+C in that terminal.");
  process.exit(0);
}

const rawPid = readFileSync(pidPath, "utf8").trim();

if (!/^\d+$/.test(rawPid)) {
  console.error(`Invalid pid in ${pidPath}: ${rawPid}`);
  process.exit(1);
}

const pid = Number(rawPid);

if (process.platform === "win32") {
  spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
    stdio: "inherit",
  });
} else {
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      /* ignore */
    }
  }
}

rmSync(pidPath, { force: true });
rmSync(logPath, { force: true });
console.log("Stopped the background dev server if it was still running.");
