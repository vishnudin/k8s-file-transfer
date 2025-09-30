const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  selectLocalDirectory: () => ipcRenderer.invoke('select-local-directory'),
  selectLocalFiles: () => ipcRenderer.invoke('select-local-files'),
  
  // Kubernetes operations
  getKubectlContexts: () => ipcRenderer.invoke('get-kubectl-contexts'),
  getNamespaces: (context) => ipcRenderer.invoke('get-namespaces', context),
  getPods: (context, namespace) => ipcRenderer.invoke('get-pods', context, namespace),
  getPodContainers: (context, namespace, podName) => ipcRenderer.invoke('get-pod-containers', context, namespace, podName),
  
  // File transfer operations
  transferToPod: (transferData) => ipcRenderer.invoke('transfer-to-pod', transferData),
  transferFromPod: (transferData) => ipcRenderer.invoke('transfer-from-pod', transferData),
  listPodFiles: (podData) => ipcRenderer.invoke('list-pod-files', podData),
  
  // Utility
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
