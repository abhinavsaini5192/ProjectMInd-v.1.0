import { Evidence } from './Evidence';

export type LearningCategory =
  | 'PROJECT_CONVENTION'
  | 'ARCHITECTURAL_FACT'
  | 'DEPENDENCY_FACT'
  | 'FAILURE_PATTERN'
  | 'SUCCESS_PATTERN'
  | 'USER_PREFERENCE'
  | 'WORKFLOW_PATTERN'
  | 'ENVIRONMENT_FACT'
  | 'TEMPORARY_STATE'
  | 'UNRESOLVED_ISSUE';

export type LearningConfidenceLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type LearningScope =
  | 'EXECUTION'
  | 'TASK'
  | 'FILE'
  | 'MODULE'
  | 'REPOSITORY'
  | 'WORKSPACE'
  | 'GLOBAL';

export type TemporalType = 'PERSISTENT' | 'TEMPORARY' | 'EXPIRING';

export interface LearningCandidate {
  candidateId: string;
  category: LearningCategory;
  content: string;
  confidence: LearningConfidenceLevel;
  confidenceScore: number;
  evidence: Evidence[];
  source: string;
  scope: LearningScope;
  temporalType: TemporalType;
  expiresAt?: number;
  promotionStatus?: 'OBSERVATION' | 'CANDIDATE' | 'CONFIRMED' | 'PROMOTED';
  createdAt: number;
}
