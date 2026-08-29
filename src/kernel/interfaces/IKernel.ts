import { KernelState } from '../models/KernelState';
import { KernelHealth } from '../models/KernelMetrics';

export interface IKernel {
  boot(): Promise<void>;
  shutdown(): Promise<void>;
  getState(): KernelState;
  getHealth(): Promise<KernelHealth>;
}

export interface IKernelScheduler {
  scheduleImmediate(task: any): void;
  scheduleBackground(task: any): void;
  scheduleDelayed(task: any, delayMs: number): void;
}

export interface IKernelPipeline {
  addStage(name: string, execute: () => Promise<void>, rollback?: () => Promise<void>): void;
  execute(): Promise<void>;
  cancel(): Promise<void>;
}

export interface IKernelEventDispatcher {
  publish(event: string, payload: any): void;
  subscribe(event: string, handler: (payload: any) => void): void;
}
