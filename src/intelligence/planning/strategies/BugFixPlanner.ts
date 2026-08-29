import { PlanningStrategy } from './PlanningStrategy';
import { Decision } from '../models/Decision';
import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { ActionPlan } from '../models/ActionPlan';
import { ActionStep } from '../models/ActionStep';

export class BugFixPlanner implements PlanningStrategy {
  public readonly name = 'BugFixPlanner';
  public readonly version = '1.0';

  public supports(decision: Decision): boolean {
    return decision.type === 'MODIFY' || decision.type === 'INVESTIGATE';
  }

  public buildPlan(decision: Decision, reasoning: ReasoningResult, knowledgeVersion: string = '1.0'): ActionPlan {
    const planId = `plan_bug_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const targetName = decision.statement || 'target_module';

    const steps: ActionStep[] = [
      {
        stepId: `${planId}_s1`,
        order: 1,
        type: 'INSPECT',
        description: `Inspect ${targetName} and related token configuration`,
        reason: 'Verify current source code implementation against observed failure',
        target: { type: 'SYMBOL', id: targetName },
        dependencies: [],
        preconditions: [`Symbol ${targetName} exists`],
        expectedOutcome: 'Implementation details understood',
        riskLevel: 'LOW',
        validation: ['File exists and is readable'],
        reversibility: 'REVERSIBLE'
      },
      {
        stepId: `${planId}_s2`,
        order: 2,
        type: 'TEST',
        description: `Reproduce failure by running test suite for ${targetName}`,
        reason: 'Establish baseline failing test case before modification',
        target: { type: 'TEST', id: `test_${targetName}` },
        dependencies: [`${planId}_s1`],
        preconditions: ['Test suite available'],
        expectedOutcome: 'Failure reproduced deterministically',
        riskLevel: 'LOW',
        validation: ['Test run completed'],
        reversibility: 'REVERSIBLE'
      },
      {
        stepId: `${planId}_s3`,
        order: 3,
        type: 'MODIFY',
        description: `Apply targeted fix to ${targetName}`,
        reason: reasoning.conclusions[0]?.statement || 'Resolve defect',
        target: { type: 'SYMBOL', id: targetName },
        dependencies: [`${planId}_s2`],
        preconditions: ['Baseline established'],
        expectedOutcome: 'Defect corrected in source code',
        riskLevel: 'MEDIUM',
        validation: ['Syntax check passes', 'Linter passes'],
        reversibility: 'REVERSIBLE'
      },
      {
        stepId: `${planId}_s4`,
        order: 4,
        type: 'VALIDATE',
        description: `Run full regression tests for ${targetName} and dependent modules`,
        reason: 'Ensure fix resolves defect without introducing regressions',
        target: { type: 'TEST', id: 'regression_suite' },
        dependencies: [`${planId}_s3`],
        preconditions: ['Modifications applied'],
        expectedOutcome: 'All unit and integration tests pass',
        riskLevel: 'LOW',
        validation: ['100% test pass rate'],
        reversibility: 'REVERSIBLE'
      }
    ];

    return {
      planId,
      decisionId: decision.decisionId,
      taskId: decision.taskId,
      objective: `Fix bug: ${decision.statement}`,
      status: 'DRAFT',
      steps,
      dependencies: [
        { stepId: `${planId}_s2`, dependsOnStepId: `${planId}_s1`, type: 'HARD' },
        { stepId: `${planId}_s3`, dependsOnStepId: `${planId}_s2`, type: 'HARD' },
        { stepId: `${planId}_s4`, dependsOnStepId: `${planId}_s3`, type: 'HARD' }
      ],
      preconditions: [
        { type: 'SYMBOL_EXISTS', target: targetName }
      ],
      postconditions: [
        { conditionId: 'post_1', description: 'Failing tests pass with 0 regressions', testable: true }
      ],
      risks: [
        { level: 'LOW', factors: ['Isolated change to single component'] }
      ],
      validationPlan: {
        validationId: `vplan_${planId}`,
        steps: ['Run unit tests', 'Run type checking'],
        requiredTests: [`test_${targetName}`],
        typeCheck: true,
        architectureCheck: false,
        dependencyCheck: true
      },
      affectedResources: [targetName],
      estimatedComplexity: 'LOW',
      confidence: decision.confidence,
      knowledgeVersion,
      contextVersion: '1.0',
      reasoningId: decision.reasoningId,
      createdAt: Date.now()
    };
  }
}
