export type ActionStepType =
  | 'INSPECT'
  | 'ANALYZE'
  | 'MODIFY'
  | 'CREATE'
  | 'DELETE'
  | 'MOVE'
  | 'RENAME'
  | 'TEST'
  | 'BUILD'
  | 'VALIDATE'
  | 'DOCUMENT'
  | 'REVIEW';

export type ReversibilityType =
  | 'REVERSIBLE'
  | 'PARTIALLY_REVERSIBLE'
  | 'IRREVERSIBLE'
  | 'UNKNOWN';

export interface ResourceTarget {
  type: 'FILE' | 'MODULE' | 'SYMBOL' | 'FEATURE' | 'DEPENDENCY' | 'CONFIGURATION' | 'TEST' | 'DATABASE_ENTITY';
  id: string;
  name?: string;
}

export interface ActionStep {
  stepId: string;
  order: number;
  type: ActionStepType;
  description: string;
  reason: string;
  target: ResourceTarget;
  dependencies: string[];
  preconditions: string[];
  expectedOutcome: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  validation: string[];
  reversibility: ReversibilityType;
}
