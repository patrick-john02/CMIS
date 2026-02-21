const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let djangoProcess;

const isDev = !app.isPackaged;

function startDjangoServer() {
  if (isDev) {
    console.log('Starting Django development server...');
    djangoProcess = spawn('python', ['backend/manage.py', 'runserver', '8000'], {
      cwd: path.join(__dirname, '..')
    });
  } else {
    console.log('Starting Django production server...');
    // Path to the PyInstaller compiled backend inside the packaged app
    const backendPath = path.join(process.resourcesPath, 'backend', 'backend.exe');
    djangoProcess = spawn(backendPath, [], {
      cwd: path.join(process.resourcesPath, 'backend')
    });
  }

  djangoProcess.stdout.on('data', data => console.log(`Django: ${data}`));
  djangoProcess.stderr.on('data', data => console.error(`Django Error: ${data}`));
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