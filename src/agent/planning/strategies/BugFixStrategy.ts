import { IPlanningStrategy } from './IPlanningStrategy';
import { PlanStep, StepType } from '../models/PlanStep';

export class BugFixStrategy implements IPlanningStrategy {
  public generateSteps(objective: string, scope: string[]): PlanStep[] {
    return [
      {
        stepId: 'investigate_bug',
        description: `Investigate root cause for: ${objective}`,
        type: StepType.INVESTIGATION,
        dependencies: [],
        affectedEntities: scope,
        expectedOutcome: 'Identified root cause of the bug.',
        risk: 'LOW',
        confidence: 0.8
      },
      {
        stepId: 'modify_code',
        description: 'Implement the fix.',
        type: StepType.MODIFICATION,
        dependencies: ['investigate_bug'],
        affectedEntities: scope,
        expectedOutcome: 'Bug is resolved.',
        risk: 'MEDIUM',
        confidence: 0.7
      },
      {
        stepId: 'verify_fix',
        description: 'Run unit and integration tests to verify the fix.',
        type: StepType.VERIFICATION,
        dependencies: ['modify_code'],
        affectedEntities: scope,
        expectedOutcome: 'Tests pass and bug is verified fixed.',
        risk: 'LOW',
        confidence: 0.9
      }
    ];
  }
}
