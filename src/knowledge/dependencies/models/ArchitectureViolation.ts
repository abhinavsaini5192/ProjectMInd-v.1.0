export enum ViolationSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export interface ArchitectureViolation {
  id: string;
  ruleName: string;
  type: string; // 'CircularDependency', 'LayerViolation', etc.
  severity: ViolationSeverity;
  path: string[]; // Symbol IDs involved
  description: string;
}
