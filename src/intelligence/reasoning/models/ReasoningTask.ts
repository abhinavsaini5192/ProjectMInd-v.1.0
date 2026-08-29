import { ContextPackage } from '../../context/models/ContextPackage';

export enum ReasoningTaskType {
  BUG_ANALYSIS = 'BUG_ANALYSIS',
  CODE_REVIEW = 'CODE_REVIEW',
  ARCHITECTURE_ANALYSIS = 'ARCHITECTURE_ANALYSIS',
  CHANGE_PLANNING = 'CHANGE_PLANNING',
  IMPLEMENTATION_PLANNING = 'IMPLEMENTATION_PLANNING',
  EXPLANATION = 'EXPLANATION',
  GENERAL_ANALYSIS = 'GENERAL_ANALYSIS'
}

export interface ReasoningTask {
  taskId: string;
  type: ReasoningTaskType;
  objective: string;
  constraints?: string[];
  contextPackage: ContextPackage;
  expectedOutput?: string;
  modelInformation?: Record<string, any>;
}
