const { contextBridge } = require('electron');

// Expose minimal, secure APIs to the Vue frontend if needed later
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => process.env.npm_package_version,
});