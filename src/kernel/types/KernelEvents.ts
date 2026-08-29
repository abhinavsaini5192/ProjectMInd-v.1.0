export enum KernelEventType {
  SystemBoot = 'Kernel:SystemBoot',
  SystemShutdown = 'Kernel:SystemShutdown',
  TaskEnqueued = 'Kernel:TaskEnqueued',
  TaskStarted = 'Kernel:TaskStarted',
  TaskCompleted = 'Kernel:TaskCompleted',
  TaskFailed = 'Kernel:TaskFailed',
  PipelineStarted = 'Kernel:PipelineStarted',
  PipelineCompleted = 'Kernel:PipelineCompleted',
  PipelineRollback = 'Kernel:PipelineRollback',
  HealthDegraded = 'Kernel:HealthDegraded',
  CrashRecovered = 'Kernel:CrashRecovered'
}

export class KernelError extends Error {
  constructor(public code: string, message: string, public details?: any) {
    super(message);
    this.name = 'KernelError';
  }
}
