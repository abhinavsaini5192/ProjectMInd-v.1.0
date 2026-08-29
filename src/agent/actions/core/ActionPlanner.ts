import { TaskPlan } from '../../planning/models/TaskPlan';
import { StepType, PlanStep } from '../../planning/models/PlanStep';
import { ActionGraph } from '../models/ActionGraph';
import { AgentAction } from '../models/AgentAction';
import { IActionGenerator } from '../generators/IActionGenerator';
import { InvestigationActionGenerator } from '../generators/InvestigationActionGenerator';
import { ModificationActionGenerator } from '../generators/ModificationActionGenerator';
import { VerificationActionGenerator } from '../generators/VerificationActionGenerator';
import { RepositoryActionGenerator } from '../generators/RepositoryActionGenerator';

export class ActionPlanner {
  private generators: Map<StepType, IActionGenerator> = new Map();

  constructor() {
    this.generators.set(StepType.INVESTIGATION, new InvestigationActionGenerator());
    this.generators.set(StepType.ANALYSIS, new InvestigationActionGenerator());
    this.generators.set(StepType.DESIGN, new InvestigationActionGenerator());
    this.generators.set(StepType.MODIFICATION, new ModificationActionGenerator());
    this.generators.set(StepType.VERIFICATION, new VerificationActionGenerator());
    this.generators.set(StepType.DOCUMENTATION, new ModificationActionGenerator());
    this.generators.set(StepType.CLEANUP, new RepositoryActionGenerator());
  }

  public generateActionGraph(plan: TaskPlan): ActionGraph {
    const graph = new ActionGraph();
    const stepToActionMap = new Map<string, AgentAction[]>();
    const allGeneratedActions: AgentAction[] = [];

    // Pass 1: Generate all actions without linking dependencies yet
    for (const step of plan.steps) {
      const generator = this.generators.get(step.type);
      if (!generator) {
         throw new Error(`No action generator found for step type: ${step.type}`);
      }
      const generatedActions = generator.generate(step, plan.taskId, plan.planId);
      stepToActionMap.set(step.stepId, generatedActions);
      allGeneratedActions.push(...generatedActions);
    }

    // Pass 2: Link dependencies based on the original plan step dependencies
    for (const step of plan.steps) {
      const actionsForStep = stepToActionMap.get(step.stepId) || [];
      
      const linkedDependencyIds: string[] = [];
      for (const planDepId of step.dependencies) {
         const prerequisiteActions = stepToActionMap.get(planDepId);
         if (!prerequisiteActions) {
            throw new Error(`Invalid plan: dependency ${planDepId} not found.`);
         }
         linkedDependencyIds.push(...prerequisiteActions.map(a => a.actionId));
      }

      for (const action of actionsForStep) {
        const linkedAction: AgentAction = {
          ...action,
          dependencies: linkedDependencyIds
        };
        graph.addAction(linkedAction);
      }
    }

    // Ensure the resulting action graph is acyclic
    graph.validateAcyclic();

    return graph;
  }
}
