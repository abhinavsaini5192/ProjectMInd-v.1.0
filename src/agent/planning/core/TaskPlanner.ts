import { AgentTask } from '../../models/AgentTask';
import { IBrainGateway } from '../../interfaces/IBrainGateway';
import { TaskPlan, TaskIntent } from '../models/TaskPlan';
import { TaskUnderstanding } from './TaskUnderstanding';
import { AmbiguityDetector } from '../analyzers/AmbiguityDetector';
import { ScopeAnalyzer } from '../analyzers/ScopeAnalyzer';
import { RiskAnalyzer } from '../analyzers/RiskAnalyzer';
import { DependencyPlanner } from '../analyzers/DependencyPlanner';
import { PlanValidator } from '../validators/PlanValidator';
import { PlanOptimizer } from '../validators/PlanOptimizer';
import { BugFixStrategy } from '../strategies/BugFixStrategy';
import { FeatureStrategy } from '../strategies/FeatureStrategy';
import { IPlanningStrategy } from '../strategies/IPlanningStrategy';

export class TaskPlanner {
  constructor(
    private brainGateway: IBrainGateway,
    private taskUnderstanding: TaskUnderstanding = new TaskUnderstanding(),
    private ambiguityDetector: AmbiguityDetector = new AmbiguityDetector(),
    private scopeAnalyzer: ScopeAnalyzer = new ScopeAnalyzer(),
    private riskAnalyzer: RiskAnalyzer = new RiskAnalyzer(),
    private dependencyPlanner: DependencyPlanner = new DependencyPlanner(),
    private planValidator: PlanValidator = new PlanValidator(new DependencyPlanner()),
    private planOptimizer: PlanOptimizer = new PlanOptimizer()
  ) {}

  public async createPlan(task: AgentTask): Promise<TaskPlan> {
    
    // 1. Fetch Brain Context
    const context = await this.brainGateway.requestContext(task);

    // 2. Understand intent
    const understanding = this.taskUnderstanding.understand(task.request);
    
    // 3. Detect Ambiguity
    const knownEntities = [...context.primaryContext, ...context.secondaryContext];
    const ambiguityCheck = this.ambiguityDetector.detect(task.request, knownEntities);
    
    if (ambiguityCheck.ambiguous) {
       throw new Error(`Task is too ambiguous to plan safely: ${task.request}`);
    }

    // 4. Analyze Scope
    const scope = this.scopeAnalyzer.analyze(context);

    // 5. Select Strategy
    let strategy: IPlanningStrategy;
    if (understanding.intent === TaskIntent.FEATURE) {
       strategy = new FeatureStrategy();
    } else {
       // Default to BugFix flow for simplicity
       strategy = new BugFixStrategy();
    }

    // 6. Generate Steps and Order Them
    let steps = strategy.generateSteps(understanding.objective, scope);
    steps = this.dependencyPlanner.sortSteps(steps);

    // 7. Calculate Risk and Approval
    const riskCheck = this.riskAnalyzer.calculateRisk(scope, understanding.intent);
    const requiresApproval = riskCheck.level === 'HIGH' || riskCheck.level === 'CRITICAL';

    // 8. Build Draft Plan
    let plan: TaskPlan = {
      planId: `plan_${Date.now()}`,
      taskId: task.taskId,
      objective: understanding.objective,
      intent: understanding.intent,
      scope,
      steps,
      dependencies: context.dependencies,
      affectedEntities: scope,
      risk: riskCheck.level,
      confidence: understanding.confidence,
      approvalRequirement: requiresApproval,
      assumptions: ['Assuming Brain context is complete'],
      warnings: riskCheck.reasons,
      createdAt: Date.now()
    };

    // 9. Optimize and Validate
    plan = this.planOptimizer.optimize(plan);
    this.planValidator.validate(plan);

    return plan;
  }
}
