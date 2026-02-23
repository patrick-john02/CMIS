const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let djangoProcess;

const isDev = !app.isPackaged;

// In your electron main.js
function startDjangoServer() {
  const backendDir = isDev 
    ? path.join(__dirname, '../../backend') 
    // In production, this points to resources/backend
    : path.join(process.resourcesPath, 'backend');

  const backendPath = isDev
    ? 'python' 
    : path.join(backendDir, 'backend.exe'); // Directly call the wrapped executable

  const args = isDev
    ? ['manage.py', 'runserver', '127.0.0.1:8000']
    : []; // arguments baked into run_server.py

  djangoProcess = spawn(backendPath, args, {
    cwd: backendDir, // Crucial: sets the working directory so it finds _internal/ and db.sqlite3
    env: { ...process.env, DJANGO_SETTINGS_MODULE: 'config.settings' }
  });

  djangoProcess.stdout.on('data', data => console.log(`Django: ${data}`));
  djangoProcess.stderr.on('data', data => console.error(`Django Error: ${data}`));
  
  // ADD THIS TO CATCH CRASHES:
  djangoProcess.on('close', (code) => {
    console.log(`Django process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'CSU Massage Inventory Management System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173'); // Vite dev server
  } else {
    // Load built Vue files
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
}

app.whenReady().then(() => {
  startDjangoServer();
  createWindow();
});

app.on('will-quit', () => {
  if (djangoProcess) djangoProcess.kill();
});