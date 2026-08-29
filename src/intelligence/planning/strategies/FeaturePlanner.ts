import { PlanningStrategy } from './PlanningStrategy';
import { Decision } from '../models/Decision';
import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { ActionPlan } from '../models/ActionPlan';

export class FeaturePlanner implements PlanningStrategy {
  public readonly name = 'FeaturePlanner';
  public readonly version = '1.0';

  public supports(decision: Decision): boolean {
    return decision.type === 'CREATE';
  }

  public buildPlan(decision: Decision, reasoning: ReasoningResult, knowledgeVersion: string = '1.0'): ActionPlan {
    const planId = `plan_feat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const targetName = decision.statement || 'new_feature';

    return {
      planId,
      decisionId: decision.decisionId,
      taskId: decision.taskId,
      objective: `Implement feature: ${decision.statement}`,
      status: 'DRAFT',
      steps: [
        {
          stepId: `${planId}_s1`,
          order: 1,
          type: 'ANALYZE',
          description: `Analyze architectural requirements for ${targetName}`,
          reason: 'Determine interfaces and dependency contracts',
          target: { type: 'FEATURE', id: targetName },
          dependencies: [],
          preconditions: [],
          expectedOutcome: 'Feature design verified',
          riskLevel: 'LOW',
          validation: ['Architecture check passes'],
          reversibility: 'REVERSIBLE'
        },
        {
          stepId: `${planId}_s2`,
          order: 2,
          type: 'CREATE',
          description: `Create initial implementation files for ${targetName}`,
          reason: 'Scaffold new feature modules',
          target: { type: 'MODULE', id: targetName },
          dependencies: [`${planId}_s1`],
          preconditions: ['Design verified'],
          expectedOutcome: 'New files created',
          riskLevel: 'MEDIUM',
          validation: ['Compilation succeeds'],
          reversibility: 'REVERSIBLE'
        },
        {
          stepId: `${planId}_s3`,
          order: 3,
          type: 'TEST',
          description: `Add test suite for ${targetName}`,
          reason: 'Ensure full test coverage for newly created feature',
          target: { type: 'TEST', id: `test_${targetName}` },
          dependencies: [`${planId}_s2`],
          preconditions: ['Implementation complete'],
          expectedOutcome: 'New test cases execute',
          riskLevel: 'LOW',
          validation: ['Tests pass'],
          reversibility: 'REVERSIBLE'
        }
      ],
      dependencies: [
        { stepId: `${planId}_s2`, dependsOnStepId: `${planId}_s1`, type: 'HARD' },
        { stepId: `${planId}_s3`, dependsOnStepId: `${planId}_s2`, type: 'HARD' }
      ],
      preconditions: [],
      postconditions: [
        { conditionId: 'post_feat_1', description: 'Feature compiled and tested', testable: true }
      ],
      risks: [
        { level: 'MEDIUM', factors: ['New module introduced into dependency tree'] }
      ],
      validationPlan: {
        validationId: `vplan_${planId}`,
        steps: ['Compile project', 'Run new feature tests'],
        requiredTests: [`test_${targetName}`],
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
