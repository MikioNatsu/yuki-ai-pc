import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("vrAssistant", {
  auth: {
    getToken: () => ipcRenderer.invoke("auth:get-token"),
    setToken: (token) => ipcRenderer.invoke("auth:set-token", token),
    clearToken: () => ipcRenderer.invoke("auth:clear-token")
  },
  localDb: {
    init: () => ipcRenderer.invoke("localdb:init"),
    saveMessage: (message) => ipcRenderer.invoke("localdb:save-message", message),
    getMessages: (limit) => ipcRenderer.invoke("localdb:get-messages", limit),
    getSettings: () => ipcRenderer.invoke("localdb:get-settings"),
    setSetting: (key, value) => ipcRenderer.invoke("localdb:set-setting", key, value)
  },
  stt: {
    start: () => ipcRenderer.invoke("stt:start"),
    stop: () => ipcRenderer.invoke("stt:stop")
  },
  commands: {
    execute: (command) => ipcRenderer.invoke("command:execute", command)
  },
  notifications: {
    show: (title, body) => ipcRenderer.invoke("notification:show", title, body)
  }
});
