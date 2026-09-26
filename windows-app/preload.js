const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pico', {
  config: () => ipcRenderer.invoke('firmware:config'),
  scan: () => ipcRenderer.invoke('drives:scan'),
  verify: () => ipcRenderer.invoke('firmware:verify'),
  installBoot: root => ipcRenderer.invoke('pico:installBoot', root),
  flash: root => ipcRenderer.invoke('pico:flash', root),
  open: root => ipcRenderer.invoke('pico:open', root),
  openActions: () => ipcRenderer.invoke('links:actions')
});
