import { IPlanningStrategy } from './IPlanningStrategy';
import { PlanStep, StepType } from '../models/PlanStep';

export class FeatureStrategy implements IPlanningStrategy {
  public generateSteps(objective: string, scope: string[]): PlanStep[] {
    return [
      {
        stepId: 'design_feature',
        description: `Design architecture for: ${objective}`,
        type: StepType.DESIGN,
        dependencies: [],
        affectedEntities: scope,
        expectedOutcome: 'Architectural approach approved.',
        risk: 'LOW',
        confidence: 0.8
      },
      {
        stepId: 'implement_feature',
        description: 'Write the code for the new feature.',
        type: StepType.MODIFICATION,
        dependencies: ['design_feature'],
        affectedEntities: scope,
        expectedOutcome: 'Feature is implemented.',
        risk: 'MEDIUM',
        confidence: 0.7
      },
      {
        stepId: 'verify_feature',
        description: 'Verify feature functionality and edge cases.',
        type: StepType.VERIFICATION,
        dependencies: ['implement_feature'],
        affectedEntities: scope,
        expectedOutcome: 'Feature meets requirements without regressions.',
        risk: 'LOW',
        confidence: 0.9
      },
      {
        stepId: 'document_feature',
        description: 'Update user/API documentation.',
        type: StepType.DOCUMENTATION,
        dependencies: ['verify_feature'],
        affectedEntities: scope,
        expectedOutcome: 'Feature is documented.',
        risk: 'LOW',
        confidence: 0.9
      }
    ];
  }
}
