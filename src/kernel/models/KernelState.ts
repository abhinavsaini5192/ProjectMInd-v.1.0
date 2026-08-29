export enum KernelState {
  Booting = 'Booting',
  Running = 'Running',
  Suspended = 'Suspended',
  Recovering = 'Recovering',
  ShuttingDown = 'ShuttingDown',
  Stopped = 'Stopped'
}

export enum TaskPriority {
  Critical = 0,
  High = 1,
  Normal = 2,
  Low = 3,
  Background = 4
}

export interface KernelTask {
  id: string;
  name: string;
  priority: TaskPriority;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  dependencies?: string[]; // IDs of tasks that must complete first
  execute: () => Promise<void>;
  rollback?: () => Promise<void>;
  retryPolicy?: {
    maxRetries: number;
    currentRetries: number;
    delayMs: number;
  };
  timeoutMs?: number;
  createdAt: number;
}
