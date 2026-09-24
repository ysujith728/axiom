import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@axiom/shared';

// Expose safe, typed API bridge to renderer
contextBridge.exposeInMainWorld('axiom', {
  startGoal: (goal: string) => ipcRenderer.invoke(IPC_CHANNELS.AGENT_START_GOAL, goal),
  launchApp: (appName: string) => ipcRenderer.invoke('axiom:system:launch-app', appName),
  cancelTask: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_CANCEL),
  respondPermission: (allowed: boolean) => ipcRenderer.invoke(IPC_CHANNELS.PERMISSION_RESPONSE, allowed),
  getMetrics: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_METRICS),
  listModels: () => ipcRenderer.invoke(IPC_CHANNELS.MODELS_LIST),
  queryMemory: (query?: string, category?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.MEMORY_QUERY, query, category),
  storeMemory: (category: string, key: string, value: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.MEMORY_STORE, category, key, value),
  deleteMemory: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.MEMORY_DELETE, id),

  // Window Controls
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),

  // Event Subscriptions
  onAgentState: (callback: (state: string) => void) => {
    const handler = (_: any, data: any) => callback(data.state);
    ipcRenderer.on(IPC_CHANNELS.AGENT_STATE_CHANGE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_STATE_CHANGE, handler);
  },
  onPlanUpdate: (callback: (plan: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.AGENT_PLAN_UPDATE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_PLAN_UPDATE, handler);
  },
  onStepUpdate: (callback: (step: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.AGENT_STEP_UPDATE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_STEP_UPDATE, handler);
  },
  onPermissionRequest: (callback: (request: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.PERMISSION_REQUEST, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.PERMISSION_REQUEST, handler);
  },
});
