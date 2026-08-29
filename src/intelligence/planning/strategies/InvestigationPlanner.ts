import { PlanningStrategy } from './PlanningStrategy';
import { Decision } from '../models/Decision';
import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { ActionPlan } from '../models/ActionPlan';

export class InvestigationPlanner implements PlanningStrategy {
  public readonly name = 'InvestigationPlanner';
  public readonly version = '1.0';

  public supports(decision: Decision): boolean {
    return decision.type === 'NEEDS_INFORMATION' || decision.type === 'NO_ACTION' || decision.type === 'DEFER';
  }

  public buildPlan(decision: Decision, reasoning: ReasoningResult, knowledgeVersion: string = '1.0'): ActionPlan {
    const planId = `plan_inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const missingInfo = reasoning.uncertainty.flatMap(u => u.missingInformation || []);

    return {
      planId,
      decisionId: decision.decisionId,
      taskId: decision.taskId,
      objective: `Investigate: ${decision.statement}`,
      status: 'VALIDATED',
      steps: [
        {
          stepId: `${planId}_s1`,
          order: 1,
          type: 'INSPECT',
          description: `Gather additional context on: ${missingInfo.join(', ') || decision.statement}`,
          reason: 'Resolve uncertainty and missing evidence',
          target: { type: 'MODULE', id: 'investigation_target' },
          dependencies: [],
          preconditions: [],
          expectedOutcome: 'Additional diagnostics collected',
          riskLevel: 'LOW',
          validation: ['Information gathered'],
          reversibility: 'REVERSIBLE'
        }
      ],
      dependencies: [],
      preconditions: [],
      postconditions: [
        { conditionId: 'post_inv_1', description: 'Diagnostic evidence obtained for reasoning iteration', testable: true }
      ],
      risks: [
        { level: 'LOW', factors: ['Read-only inspection'] }
      ],
      validationPlan: {
        validationId: `vplan_${planId}`,
        steps: ['Verify diagnostics completeness'],
        requiredTests: [],
        typeCheck: false,
        architectureCheck: false,
        dependencyCheck: false
      },
      affectedResources: ['investigation_target'],
      estimatedComplexity: 'LOW',
      confidence: decision.confidence,
      knowledgeVersion,
      contextVersion: '1.0',
      reasoningId: decision.reasoningId,
      informationRequests: missingInfo.map((info, idx) => ({
        requestId: `inforeq_${idx + 1}`,
        type: 'MISSING_EVIDENCE',
        description: info
      })),
      createdAt: Date.now()
    };
  }
}
