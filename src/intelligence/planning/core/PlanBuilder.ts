import { ActionStep, ActionStepType, ResourceTarget, ReversibilityType } from '../models/ActionStep';
import { ActionDependency } from '../models/ActionDependency';

export class PlanBuilder {
  private stepCounter = 1;
  private steps: ActionStep[] = [];
  private dependencies: ActionDependency[] = [];

  constructor(private planPrefix: string = 'step') {}

  public addStep(params: {
    type: ActionStepType;
    description: string;
    reason: string;
    target: ResourceTarget;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reversibility?: ReversibilityType;
    preconditions?: string[];
    validation?: string[];
    dependsOnPrevious?: boolean;
  }): this {
    const stepId = `${this.planPrefix}_${this.stepCounter}`;
    const order = this.stepCounter;
    const deps: string[] = [];

    if (params.dependsOnPrevious && this.stepCounter > 1) {
      const prevStepId = `${this.planPrefix}_${this.stepCounter - 1}`;
      deps.push(prevStepId);
      this.dependencies.push({
        stepId,
        dependsOnStepId: prevStepId,
        type: 'HARD'
      });
    }

    this.steps.push({
      stepId,
      order,
      type: params.type,
      description: params.description,
      reason: params.reason,
      target: params.target,
      dependencies: deps,
      preconditions: params.preconditions || [],
      expectedOutcome: `Completed ${params.type} on ${params.target.id}`,
      riskLevel: params.riskLevel || 'LOW',
      validation: params.validation || [],
      reversibility: params.reversibility || 'REVERSIBLE'
    });

    this.stepCounter++;
    return this;
  }

  public build(): { steps: ActionStep[]; dependencies: ActionDependency[] } {
    return {
      steps: [...this.steps],
      dependencies: [...this.dependencies]
    };
  }
}
