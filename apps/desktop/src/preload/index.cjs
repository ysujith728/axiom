const { contextBridge, ipcRenderer } = require('electron');

const IPC_CHANNELS = {
  AGENT_START_GOAL: 'axiom:agent:start-goal',
  AGENT_CANCEL: 'axiom:agent:cancel',
  AGENT_STATE_CHANGE: 'axiom:agent:state-change',
  AGENT_PLAN_UPDATE: 'axiom:agent:plan-update',
  AGENT_STEP_UPDATE: 'axiom:agent:step-update',
  AGENT_MESSAGE: 'axiom:agent:message',
  PERMISSION_REQUEST: 'axiom:permission:request',
  PERMISSION_RESPONSE: 'axiom:permission:response',
  SYSTEM_GET_METRICS: 'axiom:system:get-metrics',
  MODELS_LIST: 'axiom:models:list',
  MEMORY_QUERY: 'axiom:memory:query',
  MEMORY_STORE: 'axiom:memory:store',
  MEMORY_DELETE: 'axiom:memory:delete',
  WINDOW_MINIMIZE: 'axiom:window:minimize',
  WINDOW_MAXIMIZE: 'axiom:window:maximize',
  WINDOW_CLOSE: 'axiom:window:close',
};

// Expose safe, typed API bridge to renderer
contextBridge.exposeInMainWorld('axiom', {
  startGoal: (goal) => ipcRenderer.invoke(IPC_CHANNELS.AGENT_START_GOAL, goal),
  launchApp: (appName) => ipcRenderer.invoke('axiom:system:launch-app', appName),
  cancelTask: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_CANCEL),
  respondPermission: (allowed) => ipcRenderer.invoke(IPC_CHANNELS.PERMISSION_RESPONSE, allowed),
  getMetrics: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_METRICS),
  listModels: () => ipcRenderer.invoke(IPC_CHANNELS.MODELS_LIST),
  queryMemory: (query, category) => ipcRenderer.invoke(IPC_CHANNELS.MEMORY_QUERY, query, category),
  storeMemory: (category, key, value) => ipcRenderer.invoke(IPC_CHANNELS.MEMORY_STORE, category, key, value),
  deleteMemory: (id) => ipcRenderer.invoke(IPC_CHANNELS.MEMORY_DELETE, id),

  // Window Controls
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),

  // Event Subscriptions
  onAgentState: (callback) => {
    const handler = (_, data) => callback(data.state);
    ipcRenderer.on(IPC_CHANNELS.AGENT_STATE_CHANGE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_STATE_CHANGE, handler);
  },
  onPlanUpdate: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.AGENT_PLAN_UPDATE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_PLAN_UPDATE, handler);
  },
  onStepUpdate: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.AGENT_STEP_UPDATE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_STEP_UPDATE, handler);
  },
  onPermissionRequest: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.PERMISSION_REQUEST, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.PERMISSION_REQUEST, handler);
  },
});
