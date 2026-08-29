import { Decision } from '../models/Decision';
import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { ActionPlan } from '../models/ActionPlan';
import { PlanningStrategy } from '../strategies/PlanningStrategy';
import { BugFixPlanner } from '../strategies/BugFixPlanner';
import { FeaturePlanner } from '../strategies/FeaturePlanner';
import { RefactoringPlanner } from '../strategies/RefactoringPlanner';
import { ArchitectureChangePlanner } from '../strategies/ArchitectureChangePlanner';
import { InvestigationPlanner } from '../strategies/InvestigationPlanner';
import { PlanningError } from '../errors/PlanningError';

export class ActionPlanner {
  private strategies: PlanningStrategy[] = [
    new BugFixPlanner(),
    new FeaturePlanner(),
    new RefactoringPlanner(),
    new ArchitectureChangePlanner(),
    new InvestigationPlanner()
  ];

  public registerStrategy(strategy: PlanningStrategy): void {
    this.strategies.unshift(strategy);
  }

  public plan(decision: Decision, reasoning: ReasoningResult, knowledgeVersion: string = '1.0'): ActionPlan {
    const strategy = this.strategies.find(s => s.supports(decision));
    if (!strategy) {
      throw new PlanningError(`No compatible planning strategy found for decision type: ${decision.type}`);
    }

    const primaryPlan = strategy.buildPlan(decision, reasoning, knowledgeVersion);

    // If reasoning contains alternative hypotheses/conclusions, we can create alternative plans
    if (reasoning.alternatives && reasoning.alternatives.length > 0) {
      primaryPlan.alternativePlans = reasoning.alternatives.map((alt, idx) => {
        const altDecision: Decision = {
          ...decision,
          decisionId: `${decision.decisionId}_alt_${idx + 1}`,
          statement: alt
        };
        return strategy.buildPlan(altDecision, reasoning, knowledgeVersion);
      });
    }

    return primaryPlan;
  }
}
