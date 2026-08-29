import { IKernelPipeline } from '../interfaces/IKernel';
import { KernelEventDispatcher } from './KernelEventDispatcher';
import { KernelEventType } from '../types/KernelEvents';

interface PipelineStage {
  name: string;
  execute: () => Promise<void>;
  rollback?: () => Promise<void>;
}

export class KernelPipeline implements IKernelPipeline {
  private stages: PipelineStage[] = [];
  private completedStages: PipelineStage[] = [];
  private isCancelled = false;

  constructor(private dispatcher: KernelEventDispatcher) {}

  public addStage(name: string, execute: () => Promise<void>, rollback?: () => Promise<void>): void {
    this.stages.push({ name, execute, rollback });
  }

  public async execute(): Promise<void> {
    this.dispatcher.publish(KernelEventType.PipelineStarted, { stages: this.stages.length });

    for (const stage of this.stages) {
      if (this.isCancelled) break;

      try {
        await stage.execute();
        this.completedStages.push(stage);
      } catch (error) {
        await this.rollback();
        throw error;
      }
    }

    if (!this.isCancelled) {
      this.dispatcher.publish(KernelEventType.PipelineCompleted, {});
    }
  }

  public async cancel(): Promise<void> {
    this.isCancelled = true;
    await this.rollback();
  }

  private async rollback(): Promise<void> {
    this.dispatcher.publish(KernelEventType.PipelineRollback, { completedStages: this.completedStages.length });
    
    // Rollback in reverse order
    for (let i = this.completedStages.length - 1; i >= 0; i--) {
      const stage = this.completedStages[i];
      if (stage.rollback) {
        try {
          await stage.rollback();
        } catch (e) {
          // Log rollback failure but continue rolling back other stages
          console.error(`Rollback failed for stage ${stage.name}`, e);
        }
      }
    }
  }
}
