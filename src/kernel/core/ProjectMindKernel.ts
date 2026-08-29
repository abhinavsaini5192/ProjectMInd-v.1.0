import { IKernel } from '../interfaces/IKernel';
import { KernelState } from '../models/KernelState';
import { KernelHealth } from '../models/KernelMetrics';
import { KernelEventDispatcher } from './KernelEventDispatcher';
import { KernelJobQueue } from './KernelJobQueue';
import { KernelTaskManager } from './KernelTaskManager';
import { KernelScheduler } from './KernelScheduler';
import { KernelMetricsEngine } from './KernelMetricsEngine';
import { KernelHealthManager } from './KernelHealthManager';
import { KernelRecoveryManager } from './KernelRecoveryManager';
import { KernelLifecycleManager } from './KernelLifecycleManager';
import { ILogger } from '../../workspace/interfaces/ILogger';

export class ProjectMindKernel implements IKernel {
  public dispatcher: KernelEventDispatcher;
  public queue: KernelJobQueue;
  public taskManager: KernelTaskManager;
  public scheduler: KernelScheduler;
  public metrics: KernelMetricsEngine;
  public health: KernelHealthManager;
  public recovery: KernelRecoveryManager;
  public lifecycle: KernelLifecycleManager;

  constructor(private logger: ILogger) {
    this.dispatcher = new KernelEventDispatcher();
    this.queue = new KernelJobQueue();
    this.taskManager = new KernelTaskManager(this.queue, this.dispatcher, this.logger);
    this.scheduler = new KernelScheduler(this.taskManager);
    this.metrics = new KernelMetricsEngine(this.dispatcher);
    this.health = new KernelHealthManager(this.dispatcher);
    this.recovery = new KernelRecoveryManager(this.dispatcher, this.logger);
    this.lifecycle = new KernelLifecycleManager(this.dispatcher, this.logger);
  }

  public async boot(): Promise<void> {
    await this.lifecycle.boot();
  }

  public async shutdown(): Promise<void> {
    await this.lifecycle.shutdown();
  }

  public getState(): KernelState {
    return this.lifecycle.getState();
  }

  public async getHealth(): Promise<KernelHealth> {
    return this.health.checkHealth();
  }
}
