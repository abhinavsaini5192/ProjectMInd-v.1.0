import { TaskPlan } from '../models/TaskPlan';
import { StepType } from '../models/PlanStep';
import { DependencyPlanner } from '../analyzers/DependencyPlanner';

export class PlanValidator {
  
  constructor(private dependencyPlanner: DependencyPlanner) {}

  public validate(plan: TaskPlan): void {
    if (!plan.objective) throw new Error('Plan is missing an objective.');
    if (plan.steps.length === 0) throw new Error('Plan must have at least one step.');

    // 1. Validate dependencies are acyclic (will throw if circular)
    this.dependencyPlanner.sortSteps(plan.steps);

    // 2. Validate every MODIFICATION has a downstream VERIFICATION
    for (const step of plan.steps) {
       if (step.type === StepType.MODIFICATION) {
          const hasVerification = this.findDownstreamVerification(step.stepId, plan.steps);
          if (!hasVerification) {
             throw new Error(`Invalid Plan: Modification step '${step.stepId}' lacks a downstream verification step.`);
          }
       }
    }
  }

  private findDownstreamVerification(sourceStepId: string, allSteps: import('../models/PlanStep').PlanStep[]): boolean {
    const dependents = allSteps.filter(s => s.dependencies.includes(sourceStepId));
    
    for (const dep of dependents) {
       if (dep.type === StepType.VERIFICATION) return true;
       if (this.findDownstreamVerification(dep.stepId, allSteps)) return true;
    }
    
    return false;
  }
}
