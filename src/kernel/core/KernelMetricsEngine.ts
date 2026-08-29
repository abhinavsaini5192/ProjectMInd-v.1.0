import { KernelMetrics } from '../models/KernelMetrics';
import { KernelEventDispatcher } from './KernelEventDispatcher';
import { KernelEventType } from '../types/KernelEvents';

export class KernelMetricsEngine {
  private metrics: KernelMetrics = {
    uptimeMs: 0,
    totalTasksExecuted: 0,
    failedTasks: 0,
    activePipelines: 0,
    eventBusMessageCount: 0,
    memoryUsage: process.memoryUsage()
  };

  private startTime = Date.now();

  constructor(private dispatcher: KernelEventDispatcher) {
    this.dispatcher.subscribe(KernelEventType.TaskCompleted, () => this.metrics.totalTasksExecuted++);
    this.dispatcher.subscribe(KernelEventType.TaskFailed, () => this.metrics.failedTasks++);
    this.dispatcher.subscribe(KernelEventType.PipelineStarted, () => this.metrics.activePipelines++);
    this.dispatcher.subscribe(KernelEventType.PipelineCompleted, () => this.metrics.activePipelines--);
  }

  public getMetrics(): KernelMetrics {
    this.metrics.uptimeMs = Date.now() - this.startTime;
    this.metrics.memoryUsage = process.memoryUsage();
    return this.metrics;
  }
}
