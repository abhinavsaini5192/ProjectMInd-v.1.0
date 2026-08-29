import { OutcomeAnalysis } from './OutcomeAnalysis';
import { ChangeSet } from './ChangeSet';
import { LearningCandidate } from './LearningCandidate';

export interface FeedbackResult {
  feedbackId: string;
  executionId: string;
  outcome: OutcomeAnalysis;
  changes: ChangeSet;
  learningCandidates: LearningCandidate[];
  promotedLearning: LearningCandidate[];
  rejectedLearning: LearningCandidate[];
  unresolvedIssues: string[];
  knowledgeUpdates: Array<{ target: string; operation: string }>;
  memoryUpdates: Array<{ memoryId?: string; content: string; type: string }>;
  contextInvalidations: string[];
  confidence: number;
  warnings: string[];
  errors: string[];
}
