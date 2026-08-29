import { ContextRequirement } from './ContextRequirement';

export enum TaskProfile {
  BUG_FIX = 'BUG_FIX',
  CODE_GENERATION = 'CODE_GENERATION',
  CODE_REVIEW = 'CODE_REVIEW',
  ARCHITECTURE_ANALYSIS = 'ARCHITECTURE_ANALYSIS',
  REFACTORING = 'REFACTORING',
  EXPLANATION = 'EXPLANATION',
  PROJECT_PLANNING = 'PROJECT_PLANNING',
  GENERAL = 'GENERAL'
}

export interface ContextPlan {
  planId: string;
  taskType: TaskProfile;
  taskIntent: string;
  explicitReferences: string[];
  requirements: ContextRequirement[];
  exclusions: string[];
  tokenBudget: number;
  createdAt: number;
}
