const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveExcel: (base64Data, defaultName) =>
    ipcRenderer.invoke("save-excel", base64Data, defaultName),
  isElectron: true,
});
