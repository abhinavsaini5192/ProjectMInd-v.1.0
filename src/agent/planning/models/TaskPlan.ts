import { PlanStep } from './PlanStep';

export enum TaskIntent {
  BUG_FIX = 'BUG_FIX',
  FEATURE = 'FEATURE',
  REFACTOR = 'REFACTOR',
  INVESTIGATION = 'INVESTIGATION',
  DOCUMENTATION = 'DOCUMENTATION',
  CONFIGURATION = 'CONFIGURATION',
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  UNKNOWN = 'UNKNOWN'
}

export interface TaskPlan {
  planId: string;
  taskId: string;
  objective: string;
  intent: TaskIntent;
  scope: string[]; // List of affected entities
  steps: PlanStep[];
  dependencies: string[]; // High-level repository dependencies
  affectedEntities: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  approvalRequirement: boolean;
  assumptions: string[];
  warnings: string[];
  createdAt: number;
}
