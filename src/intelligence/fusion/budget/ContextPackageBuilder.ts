import { FinalDecision } from '../models/FusionModels';
import { ContextPackage, ContextBudget } from '../models/ContextPackage';
import { ContextBudgetManager } from './ContextBudgetManager';

export class ContextPackageBuilder {
  constructor(private budgetManager: ContextBudgetManager) {}

  public buildPackage(decision: FinalDecision, taskDescription: string, budget: ContextBudget): ContextPackage {
    const trimmedEntities = this.budgetManager.trimToBudget(decision.fusedEntities, budget);

    const primaryContext: string[] = [];
    const secondaryContext: string[] = [];

    // Separate highly confident entities from marginal ones
    for (const e of trimmedEntities) {
       if (e.finalScore >= 0.8) {
          primaryContext.push(e.entityId);
       } else {
          secondaryContext.push(e.entityId);
       }
    }

    return {
      task: taskDescription,
      primaryContext,
      secondaryContext,
      architecture: [],
      dependencies: [],
      recentChanges: [],
      knownProblems: [],
      decisions: [decision.decisionId],
      confidence: primaryContext.length > 0 ? 0.9 : 0.4
    };
  }
}
