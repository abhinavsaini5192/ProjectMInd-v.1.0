import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectMindKernel } from '../../src/kernel/core/ProjectMindKernel';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import { KernelState } from '../../src/kernel/models/KernelState';
import { KernelEventType } from '../../src/kernel/types/KernelEvents';
import { KernelPipeline } from '../../src/kernel/core/KernelPipeline';

describe('ProjectMind Kernel Runtime', () => {
  let kernel: ProjectMindKernel;
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger();
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    kernel = new ProjectMindKernel(logger);
  });

  it('should boot and transition state', async () => {
    expect(kernel.getState()).toBe(KernelState.Stopped);
    await kernel.boot();
    expect(kernel.getState()).toBe(KernelState.Running);
  });

  it('should collect health and metrics', async () => {
    await kernel.boot();

    const health = await kernel.getHealth();
    expect(health.isHealthy).toBe(true);
    expect(health.state).toBe('Running');

    const metrics = kernel.metrics.getMetrics();
    expect(metrics.totalTasksExecuted).toBe(0);
    expect(metrics.activePipelines).toBe(0);
  });

  it('should process immediate tasks through the scheduler and emit events', async () => {
    await kernel.boot();
    
    let executed = false;
    const taskExecution = new Promise<void>((resolve) => {
      kernel.dispatcher.subscribe(KernelEventType.TaskCompleted, () => {
        executed = true;
        resolve();
      });
    });

    kernel.scheduler.scheduleImmediate(async () => {
      // Simulate task work
    });

    await taskExecution;
    expect(executed).toBe(true);

    const metrics = kernel.metrics.getMetrics();
    expect(metrics.totalTasksExecuted).toBe(1);
  });

  it('should execute pipelines and support rollbacks on failure', async () => {
    const pipeline = new KernelPipeline(kernel.dispatcher);
    
    let rollbackFired = false;
    let completedFired = false;

    pipeline.addStage('Stage 1', async () => {}, async () => { rollbackFired = true; });
    pipeline.addStage('Stage 2', async () => { throw new Error('Stage 2 failed'); }, async () => {});

    kernel.dispatcher.subscribe(KernelEventType.PipelineCompleted, () => { completedFired = true; });

    await expect(pipeline.execute()).rejects.toThrow('Stage 2 failed');

    expect(rollbackFired).toBe(true); // Stage 1 rollback should have been called
    expect(completedFired).toBe(false);
  });

  it('should catch system crash via RecoveryManager', async () => {
    let recovered = false;
    kernel.dispatcher.subscribe(KernelEventType.CrashRecovered, (payload) => {
      recovered = payload.success;
    });

    await kernel.recovery.recoverFromCrash(new Error('Fatal exception'));

    expect(recovered).toBe(true);
  });
});
