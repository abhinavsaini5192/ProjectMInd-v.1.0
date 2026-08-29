import { PlanningStrategy } from './PlanningStrategy';
import { Decision } from '../models/Decision';
import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { ActionPlan } from '../models/ActionPlan';

export class ArchitectureChangePlanner implements PlanningStrategy {
  public readonly name = 'ArchitectureChangePlanner';
  public readonly version = '1.0';

  public supports(decision: Decision): boolean {
    return decision.type === 'CONFIGURE' || decision.type === 'DELETE';
  }

  public buildPlan(decision: Decision, reasoning: ReasoningResult, knowledgeVersion: string = '1.0'): ActionPlan {
    const planId = `plan_arch_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const targetName = decision.statement || 'architecture_boundary';

    return {
      planId,
      decisionId: decision.decisionId,
      taskId: decision.taskId,
      objective: `Architectural Change: ${decision.statement}`,
      status: 'NEEDS_APPROVAL',
      steps: [
        {
          stepId: `${planId}_s1`,
          order: 1,
          type: 'ANALYZE',
          description: `Analyze cross-layer dependencies for ${targetName}`,
          reason: 'Assess full impact of architectural mutation',
          target: { type: 'MODULE', id: targetName },
          dependencies: [],
          preconditions: [],
          expectedOutcome: 'Impact graph computed',
          riskLevel: 'HIGH',
          validation: ['Impact assessed'],
          reversibility: 'REVERSIBLE'
        },
        {
          stepId: `${planId}_s2`,
          order: 2,
          type: decision.type === 'DELETE' ? 'DELETE' : 'MODIFY',
          description: `Execute structural modification on ${targetName}`,
          reason: 'Implement architectural change',
          target: { type: 'MODULE', id: targetName },
          dependencies: [`${planId}_s1`],
          preconditions: ['Impact assessed'],
          expectedOutcome: 'Architecture updated',
          riskLevel: 'CRITICAL',
          validation: ['Architecture rules validated'],
          reversibility: 'IRREVERSIBLE'
        }
      ],
      dependencies: [
        { stepId: `${planId}_s2`, dependsOnStepId: `${planId}_s1`, type: 'HARD' }
      ],
      preconditions: [],
      postconditions: [
        { conditionId: 'post_arch_1', description: 'Architecture verified with 0 layer violations', testable: true }
      ],
      risks: [
        { level: 'CRITICAL', factors: ['High-impact structural or destructive modification'] }
      ],
      validationPlan: {
        validationId: `vplan_${planId}`,
        steps: ['Run architecture linter', 'Verify module dependencies'],
        requiredTests: [],
        typeCheck: true,
        architectureCheck: true,
        dependencyCheck: true
      },
      affectedResources: [targetName],
      estimatedComplexity: 'HIGH',
      confidence: decision.confidence,
      knowledgeVersion,
      contextVersion: '1.0',
      reasoningId: decision.reasoningId,
      createdAt: Date.now()
    };
  }
}
