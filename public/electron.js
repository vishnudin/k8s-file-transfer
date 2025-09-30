const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development' ||
              process.defaultApp ||
              /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
              /[\\/]electron[\\/]/.test(process.execPath);

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  // Load the app - always use built files
  const indexPath = path.join(__dirname, 'index.html');
  const startUrl = `file://${indexPath}`;

  console.log('Loading application:');
  console.log('  __dirname:', __dirname);
  console.log('  indexPath:', indexPath);
  console.log('  startUrl:', startUrl);
  console.log('  Index file exists:', fs.existsSync(indexPath));

  // List files in the directory for debugging
  if (fs.existsSync(__dirname)) {
    console.log('Files in __dirname:');
    fs.readdirSync(__dirname).forEach(file => {
      console.log('  -', file);
    });
  }

  mainWindow.loadURL(startUrl);

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, 'Error:', errorDescription);
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools only when explicitly requested
  if (process.env.NODE_ENV === 'development' && process.env.OPEN_DEVTOOLS === 'true') {
    mainWindow.webContents.openDevTools();
  }

  // Add keyboard shortcut to toggle DevTools (Cmd+Option+I or Ctrl+Shift+I)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.meta && input.alt && input.key === 'i') ||
        (input.control && input.shift && input.key === 'I')) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for file operations
ipcMain.handle('select-local-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result;
});

ipcMain.handle('select-local-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections']
  });
  return result;
});

// Kubernetes operations
ipcMain.handle('get-kubectl-contexts', async () => {
  return new Promise((resolve, reject) => {
    exec('kubectl config get-contexts -o name', (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      const contexts = stdout.trim().split('\n').filter(ctx => ctx.length > 0);
      resolve(contexts);
    });
  });
});

ipcMain.handle('get-namespaces', async (event, context) => {
  return new Promise((resolve, reject) => {
    const cmd = context 
      ? `kubectl --context=${context} get namespaces -o name`
      : 'kubectl get namespaces -o name';
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      const namespaces = stdout.trim()
        .split('\n')
        .map(ns => ns.replace('namespace/', ''))
        .filter(ns => ns.length > 0);
      resolve(namespaces);
    });
  });
});

ipcMain.handle('get-pods', async (event, context, namespace) => {
  return new Promise((resolve, reject) => {
    let cmd = 'kubectl get pods -o name';
    if (context) cmd = `kubectl --context=${context} get pods -o name`;
    if (namespace) cmd += ` -n ${namespace}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      const pods = stdout.trim()
        .split('\n')
        .map(pod => pod.replace('pod/', ''))
        .filter(pod => pod.length > 0);
      resolve(pods);
    });
  });
});

// Get containers in a specific pod
ipcMain.handle('get-pod-containers', async (event, context, namespace, podName) => {
  return new Promise((resolve, reject) => {
    let cmd = 'kubectl get pod';
    if (context) cmd = `kubectl --context=${context} get pod`;
    if (namespace) cmd += ` -n ${namespace}`;
    cmd += ` ${podName} -o jsonpath='{.spec.containers[*].name}'`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      const containers = stdout.trim()
        .split(' ')
        .filter(container => container.length > 0);
      resolve(containers);
    });
  });
});

// File transfer operations
ipcMain.handle('transfer-to-pod', async (event, transferData) => {
  const { localPath, podName, podPath, namespace, context, container } = transferData;

  return new Promise((resolve, reject) => {
    let cmd = `kubectl cp "${localPath}" "${podName}:${podPath}"`;
    if (namespace) cmd = `kubectl cp "${localPath}" "${namespace}/${podName}:${podPath}"`;
    if (context) cmd = `kubectl --context=${context} cp "${localPath}" "${namespace}/${podName}:${podPath}"`;
    if (container) cmd += ` -c ${container}`;

    const process = spawn('sh', ['-c', cmd]);
    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        reject({ success: false, error, code });
      }
    });
  });
});

ipcMain.handle('transfer-from-pod', async (event, transferData) => {
  const { localPath, podName, podPath, namespace, context, container } = transferData;

  return new Promise((resolve, reject) => {
    let cmd = `kubectl cp "${podName}:${podPath}" "${localPath}"`;
    if (namespace) cmd = `kubectl cp "${namespace}/${podName}:${podPath}" "${localPath}"`;
    if (context) cmd = `kubectl --context=${context} cp "${namespace}/${podName}:${podPath}" "${localPath}"`;
    if (container) cmd += ` -c ${container}`;

    const process = spawn('sh', ['-c', cmd]);
    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        reject({ success: false, error, code });
      }
    });
  });
});

// List files in pod
ipcMain.handle('list-pod-files', async (event, podData) => {
  const { podName, podPath, namespace, context } = podData;
  
  return new Promise((resolve, reject) => {
    let cmd = `kubectl exec ${podName} -- ls -la "${podPath}"`;
    if (namespace) cmd = `kubectl exec ${podName} -n ${namespace} -- ls -la "${podPath}"`;
    if (context) cmd = `kubectl --context=${context} exec ${podName} -n ${namespace} -- ls -la "${podPath}"`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
});

// Open external links
ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});
