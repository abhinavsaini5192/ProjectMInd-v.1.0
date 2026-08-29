export interface KernelMetrics {
  uptimeMs: number;
  totalTasksExecuted: number;
  failedTasks: number;
  activePipelines: number;
  eventBusMessageCount: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export interface KernelHealth {
  state: string;
  isHealthy: boolean;
  subsystemStatuses: Record<string, 'Healthy' | 'Degraded' | 'Offline'>;
  lastCheckTimestamp: number;
}
