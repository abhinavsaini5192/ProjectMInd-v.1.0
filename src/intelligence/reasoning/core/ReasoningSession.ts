import { ReasoningValidationStatus } from '../models/ReasoningResult';

export interface ReasoningSession {
  reasoningSessionId: string;
  taskId: string;
  modelId: string;
  contextPackageId: string;
  startedAt: number;
  completedAt?: number;
  status: 'STARTED' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  validationStatus?: ReasoningValidationStatus;
  latencyMs?: number;
  retryCount: number;
  error?: Error;
}
