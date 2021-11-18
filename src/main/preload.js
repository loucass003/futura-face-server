const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nativeAPI', {
  send(channel, payload) {
    ipcRenderer.send(channel, payload);
  },
  on(channel, func) {
    ipcRenderer.on(channel, func);
  },
  removeListener(channel, func) {
    // TODO: need to fix that a some point
    ipcRenderer.removeAllListeners(channel);
  },
});
