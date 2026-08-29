import { PlanningStrategy } from './PlanningStrategy';
import { Decision } from '../models/Decision';
import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { ActionPlan } from '../models/ActionPlan';

export class RefactoringPlanner implements PlanningStrategy {
  public readonly name = 'RefactoringPlanner';
  public readonly version = '1.0';

  public supports(decision: Decision): boolean {
    return decision.type === 'REFACTOR';
  }

  public buildPlan(decision: Decision, reasoning: ReasoningResult, knowledgeVersion: string = '1.0'): ActionPlan {
    const planId = `plan_refactor_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const targetName = decision.statement || 'target_module';

    return {
      planId,
      decisionId: decision.decisionId,
      taskId: decision.taskId,
      objective: `Refactor: ${decision.statement}`,
      status: 'DRAFT',
      steps: [
        {
          stepId: `${planId}_s1`,
          order: 1,
          type: 'ANALYZE',
          description: `Analyze current dependency coupling of ${targetName}`,
          reason: 'Ensure behavior preservation during restructure',
          target: { type: 'MODULE', id: targetName },
          dependencies: [],
          preconditions: [],
          expectedOutcome: 'Coupling boundaries mapped',
          riskLevel: 'LOW',
          validation: ['Coupling metrics verified'],
          reversibility: 'REVERSIBLE'
        },
        {
          stepId: `${planId}_s2`,
          order: 2,
          type: 'MODIFY',
          description: `Apply behavior-preserving refactoring to ${targetName}`,
          reason: 'Improve code quality and reduce coupling',
          target: { type: 'MODULE', id: targetName },
          dependencies: [`${planId}_s1`],
          preconditions: ['Coupling mapped'],
          expectedOutcome: 'Refactored code with unchanged external contracts',
          riskLevel: 'MEDIUM',
          validation: ['Typecheck passes'],
          reversibility: 'REVERSIBLE'
        },
        {
          stepId: `${planId}_s3`,
          order: 3,
          type: 'VALIDATE',
          description: 'Run entire regression test suite',
          reason: 'Verify complete behavior preservation',
          target: { type: 'TEST', id: 'all_tests' },
          dependencies: [`${planId}_s2`],
          preconditions: ['Refactoring applied'],
          expectedOutcome: 'All existing tests continue to pass',
          riskLevel: 'LOW',
          validation: ['All tests pass with 0 failures'],
          reversibility: 'REVERSIBLE'
        }
      ],
      dependencies: [
        { stepId: `${planId}_s2`, dependsOnStepId: `${planId}_s1`, type: 'HARD' },
        { stepId: `${planId}_s3`, dependsOnStepId: `${planId}_s2`, type: 'HARD' }
      ],
      preconditions: [
        { type: 'TESTS_PASS', target: 'all_tests' }
      ],
      postconditions: [
        { conditionId: 'post_refactor_1', description: 'Behavior preserved with reduced coupling', testable: true }
      ],
      risks: [
        { level: 'MEDIUM', factors: ['Potential unintended behavioral side effects'] }
      ],
      validationPlan: {
        validationId: `vplan_${planId}`,
        steps: ['Run all unit tests', 'Check dependency fan-out'],
        requiredTests: ['all_tests'],
        typeCheck: true,
        architectureCheck: true,
        dependencyCheck: true
      },
      affectedResources: [targetName],
      estimatedComplexity: 'MEDIUM',
      confidence: decision.confidence,
      knowledgeVersion,
      contextVersion: '1.0',
      reasoningId: decision.reasoningId,
      createdAt: Date.now()
    };
  }
}
