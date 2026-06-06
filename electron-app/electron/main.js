import { app, BrowserWindow, Notification, ipcMain, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import keytar from "keytar";
import { initLocalDb, saveMessage, getMessages, getSettings, setSetting } from "../src/services/localdb.js";
import { createOfflineStt } from "../src/services/stt_offline.js";
import { executeCommand } from "../src/services/command_executor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceName = "vr-assistant";
const accountName = "jwt";
let mainWindow;
let stt;

function rendererUrl() {
  if (process.env.VITE_DEV_SERVER_URL) return process.env.VITE_DEV_SERVER_URL;
  if (!app.isPackaged) return "http://127.0.0.1:5173";
  return `file://${path.join(__dirname, "../dist/index.html")}`;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  await mainWindow.loadURL(rendererUrl());
}

function registerIpc() {
  ipcMain.handle("auth:get-token", () => keytar.getPassword(serviceName, accountName));
  ipcMain.handle("auth:set-token", (_event, token) => keytar.setPassword(serviceName, accountName, String(token)));
  ipcMain.handle("auth:clear-token", () => keytar.deletePassword(serviceName, accountName));

  ipcMain.handle("localdb:init", () => initLocalDb(app.getPath("userData")));
  ipcMain.handle("localdb:save-message", (_event, message) => saveMessage(message));
  ipcMain.handle("localdb:get-messages", (_event, limit = 20) => getMessages(limit));
  ipcMain.handle("localdb:get-settings", () => getSettings());
  ipcMain.handle("localdb:set-setting", (_event, key, value) => setSetting(key, value));

  ipcMain.handle("stt:start", async () => {
    stt = stt || createOfflineStt({ modelPath: process.env.VOSK_MODEL_PATH });
    return stt.start();
  });
  ipcMain.handle("stt:stop", async () => (stt ? stt.stop() : { text: "" }));

  ipcMain.handle("command:execute", async (_event, command) => executeCommand(command, { shell }));
  ipcMain.handle("notification:show", (_event, title, body) => {
    new Notification({ title: String(title || "VR Assistant"), body: String(body || "") }).show();
    return { ok: true };
  });
}

app.whenReady().then(async () => {
  registerIpc();
  initLocalDb(app.getPath("userData"));
  await createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
