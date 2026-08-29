import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { FeedbackResult } from '../../feedback/models/FeedbackResult';

export interface TaskCycle {
  cycleId: string;
  taskId: string;
  cycleNumber: number;
  contextSnapshot?: any;
  reasoningResult?: ReasoningResult;
  planId?: string;
  executionId?: string;
  feedbackId?: string;
  feedbackResult?: FeedbackResult;
  outcome?: string;
  startedAt: number;
  completedAt?: number;
}
