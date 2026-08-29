import { ContextPlanner } from './ContextPlanner';
import { ContextAssembler } from './ContextAssembler';
import { ContextPackage } from '../models/ContextPackage';
import { IContextRetriever } from '../retrieval/ContextRetriever';
import { KnowledgeRetriever } from '../retrieval/KnowledgeRetriever';
import { MemoryRetriever } from '../retrieval/MemoryRetriever';
import { DependencyRetriever } from '../retrieval/DependencyRetriever';
import { FeatureRetriever } from '../retrieval/FeatureRetriever';
import { ChangeRetriever } from '../retrieval/ChangeRetriever';
import { TaskProfile } from '../models/ContextPlan';

export class ContextEngine {
  private planner: ContextPlanner;
  private assembler: ContextAssembler;
  private retrievers: IContextRetriever[] = [];

  constructor(customRetrievers?: IContextRetriever[]) {
    this.planner = new ContextPlanner();

    if (customRetrievers && customRetrievers.length > 0) {
      this.retrievers = customRetrievers;
    } else {
      // Default default retrievers
      this.retrievers = [
        new KnowledgeRetriever(),
        new MemoryRetriever(),
        new DependencyRetriever(),
        new FeatureRetriever(),
        new ChangeRetriever()
      ];
    }

    this.assembler = new ContextAssembler(this.retrievers);
  }

  public registerRetriever(retriever: IContextRetriever): void {
    this.retrievers.push(retriever);
    this.assembler = new ContextAssembler(this.retrievers);
  }

  public async buildContext(
    taskIntent: string,
    modelContextWindow: number = 8192,
    taskProfile?: TaskProfile
  ): Promise<ContextPackage> {
    const plan = this.planner.plan(taskIntent, modelContextWindow, taskProfile);
    return this.assembler.assemble(plan, modelContextWindow);
  }
}
