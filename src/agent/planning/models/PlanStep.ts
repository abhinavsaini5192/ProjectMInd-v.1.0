export enum StepType {
  INVESTIGATION = 'INVESTIGATION',
  ANALYSIS = 'ANALYSIS',
  DESIGN = 'DESIGN',
  MODIFICATION = 'MODIFICATION',
  VERIFICATION = 'VERIFICATION',
  DOCUMENTATION = 'DOCUMENTATION',
  CLEANUP = 'CLEANUP'
}

export interface PlanStep {
  stepId: string;
  description: string;
  type: StepType;
  dependencies: string[]; // stepIds this step depends on
  affectedEntities: string[]; // Context entities this step will touch
  expectedOutcome: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
}
