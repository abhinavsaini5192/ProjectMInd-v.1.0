export type SubtaskType =
  | 'DISCOVERY'
  | 'ANALYSIS'
  | 'DESIGN'
  | 'IMPLEMENTATION'
  | 'TESTING'
  | 'VERIFICATION'
  | 'REFACTORING'
  | 'DOCUMENTATION'
  | 'USER_DECISION';

export type SubtaskStatus =
  | 'PENDING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'
  | 'WAITING_FOR_USER';

export type TaskComplexity = 'TRIVIAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface Subtask {
  subtaskId: string;
  taskId: string;
  title: string;
  objective: string;
  type: SubtaskType;
  status: SubtaskStatus;
  priority: number; // 1 (highest) to 10
  dependencies: string[]; // subtaskId list
  prerequisites: string[];
  successCriteria: string[];
  requiredContext: string[]; // types or resource hints
  estimatedComplexity: TaskComplexity;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetResources?: string[];
  createdAt: number;
  completedAt?: number;
}
