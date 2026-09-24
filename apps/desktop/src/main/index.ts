/**
 * @axiom/desktop - Electron Main Process with secure IPC and subsystem lifecycle.
 */

import { app, BrowserWindow, ipcMain, session } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { IPC_CHANNELS } from '@axiom/shared';
import { loadRuntimeConfig, getLiveSystemMetrics } from '@axiom/config';
import { PermissionEngine } from '@axiom/permissions';
import { ToolRegistry } from '@axiom/tools';
import { ModelManager } from '@axiom/models';
import { MemoryStore } from '@axiom/memory';
import { AgentRuntime } from '@axiom/agent';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Application Identity & Isolated User Data Directory
app.name = 'axiom';
app.setAppUserModelId('com.axiom.desktop');
app.commandLine.appendSwitch('disable-gpu-process-crash-limit');

try {
  const customUserData = path.join(app.getPath('appData'), 'axiom-desktop');
  app.setPath('userData', customUserData);
} catch {}

// Prevent multiple instances from colliding on disk cache
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

// Initialize Core Subsystems
const runtimeConfig = loadRuntimeConfig();
const permissionEngine = new PermissionEngine(runtimeConfig);
const toolRegistry = new ToolRegistry();
const modelManager = new ModelManager(runtimeConfig);
const memoryStore = new MemoryStore(runtimeConfig);
const agentRuntime = new AgentRuntime(
  runtimeConfig,
  permissionEngine,
  toolRegistry,
  modelManager,
  memoryStore
);

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function createWindow() {
  const preloadPath = path.join(__dirname, '../preload/index.js');

  // Automatically approve media/mic requests for local speech
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    if (permission === 'media') return true;
    return true;
  });
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    if (permission === 'media') return callback(true);
    callback(true);
  });

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#08090d',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const distHtml = path.join(__dirname, '../../dist/index.html');
  if (fs.existsSync(distHtml)) {
    mainWindow.loadFile(distHtml);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  // Forward Agent events to renderer
  agentRuntime.on('state', (data) => {
    mainWindow?.webContents.send(IPC_CHANNELS.AGENT_STATE_CHANGE, data);
  });

  agentRuntime.on('plan', (data) => {
    mainWindow?.webContents.send(IPC_CHANNELS.AGENT_PLAN_UPDATE, data);
  });

  agentRuntime.on('step', (data) => {
    mainWindow?.webContents.send(IPC_CHANNELS.AGENT_STEP_UPDATE, data);
  });

  // Handle Permission Request from Agent
  agentRuntime.on('state', (data) => {
    if (data.state === 'WAITING_FOR_PERMISSION') {
      mainWindow?.webContents.send(IPC_CHANNELS.PERMISSION_REQUEST, data);
    }
  });
}

// IPC Handlers
ipcMain.handle(IPC_CHANNELS.AGENT_START_GOAL, async (_, goal: string) => {
  return agentRuntime.executeGoal(goal);
});

ipcMain.handle(IPC_CHANNELS.AGENT_CANCEL, () => {
  agentRuntime.cancel();
  return { success: true };
});

ipcMain.handle(IPC_CHANNELS.PERMISSION_RESPONSE, (_, allowed: boolean) => {
  agentRuntime.resolvePermission(allowed);
  return { success: true };
});

ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_METRICS, () => {
  return getLiveSystemMetrics();
});

ipcMain.handle(IPC_CHANNELS.MODELS_LIST, async () => {
  return modelManager.listInstalledModels();
});

ipcMain.handle(IPC_CHANNELS.MEMORY_QUERY, (_, query?: string, category?: any) => {
  return memoryStore.query(query, category);
});

ipcMain.handle(IPC_CHANNELS.MEMORY_STORE, (_, category: any, key: string, value: string) => {
  return memoryStore.store(category, key, value);
});

ipcMain.handle(IPC_CHANNELS.MEMORY_DELETE, (_, id: string) => {
  return memoryStore.delete(id);
});

// Window Controls
ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
  mainWindow?.minimize();
});

ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
  mainWindow?.close();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
