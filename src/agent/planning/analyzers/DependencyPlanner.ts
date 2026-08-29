import { PlanStep } from '../models/PlanStep';

export class DependencyPlanner {
  
  // Sorts steps based on their explicitly defined stepId dependencies
  public sortSteps(steps: PlanStep[]): PlanStep[] {
    const sorted: PlanStep[] = [];
    const visited = new Set<string>();
    const inProgress = new Set<string>(); // Used to detect circular dependencies

    const visit = (stepId: string) => {
      if (inProgress.has(stepId)) {
         throw new Error(`Circular plan dependency detected at step ${stepId}`);
      }
      if (!visited.has(stepId)) {
        inProgress.add(stepId);
        
        const step = steps.find(s => s.stepId === stepId);
        if (step) {
           for (const depId of step.dependencies) {
             visit(depId);
           }
           sorted.push(step);
        }
        
        inProgress.delete(stepId);
        visited.add(stepId);
      }
    };

    for (const step of steps) {
       if (!visited.has(step.stepId)) {
         visit(step.stepId);
       }
    }

    return sorted;
  }
}
