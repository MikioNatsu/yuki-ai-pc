import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const allowedCommands = new Set([
  "open_file",
  "start_app",
  "show_notification",
  "copy_to_clipboard",
  "create_note",
  "play_media",
  "pause_media"
]);

function hasShellMeta(value) {
  return /[;&|`$<>]/.test(String(value));
}

export function sanitizeText(value, maxLength = 500) {
  const text = String(value || "").trim().slice(0, maxLength);
  if (!text || hasShellMeta(text) || /\b(rm\s+-rf|format|shutdown|reboot|del\s+\/)\b/i.test(text)) {
    return "";
  }
  return text;
}

export function validateLocalPath(target) {
  const clean = sanitizeText(target, 1000);
  if (!clean) throw new Error("invalid_path");
  if (/^(\\\\|\/\/|https?:|file:)/i.test(clean)) throw new Error("network_paths_disallowed");
  const absolute = path.resolve(clean);
  const home = os.homedir();
  if (!absolute.startsWith(home)) throw new Error("path_outside_home");
  if (!fs.existsSync(absolute)) throw new Error("path_not_found");
  return absolute;
}

async function openWithShell(shell, target) {
  if (shell?.openPath) {
    const result = await shell.openPath(target);
    if (result) throw new Error(result);
    return { ok: true };
  }
  if (process.platform === "win32") return execFileAsync("cmd", ["/c", "start", "", target]);
  if (process.platform === "darwin") return execFileAsync("open", [target]);
  return execFileAsync("xdg-open", [target]);
}

export async function executeCommand(action, { shell, dryRun = false } = {}) {
  if (!action || action.type !== "command" || !allowedCommands.has(action.name)) throw new Error("command_not_allowed");
  const args = action.args || {};
  if (dryRun) return { ok: true, dryRun: true, command: action.name };

  if (action.name === "open_file") {
    const target = validateLocalPath(args.target || args.path);
    return openWithShell(shell, target);
  }

  if (action.name === "show_notification") {
    return { ok: true, title: sanitizeText(args.title || "VR Assistant"), message: sanitizeText(args.message || args.body || "") };
  }

  if (action.name === "copy_to_clipboard") {
    return { ok: true, text: sanitizeText(args.text, 4000) };
  }

  if (action.name === "create_note") {
    const notesDir = path.join(os.homedir(), "Documents", "VR Assistant Notes");
    fs.mkdirSync(notesDir, { recursive: true });
    const filePath = path.join(notesDir, `${Date.now()}-note.txt`);
    fs.writeFileSync(filePath, sanitizeText(args.text, 4000), "utf8");
    return { ok: true, path: filePath };
  }

  if (action.name === "start_app") {
    const appName = sanitizeText(args.app || args.name, 120);
    const aliases = { notepad: "notepad.exe", calculator: "calc.exe" };
    if (!aliases[appName.toLowerCase()]) throw new Error("app_alias_not_whitelisted");
    await execFileAsync(aliases[appName.toLowerCase()], []);
    return { ok: true };
  }

  return { ok: true, command: action.name };
}

export { allowedCommands };
