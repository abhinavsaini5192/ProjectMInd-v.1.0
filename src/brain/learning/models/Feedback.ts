export interface Feedback {
  feedbackId: string;
  decisionId: string;
  rating: 'HELPFUL' | 'PARTIALLY_HELPFUL' | 'WRONG_CONTEXT' | 'MISSING_CONTEXT' | 'MISLEADING_CONTEXT' | 'INCOMPLETE';
  comments?: string;
  missingEntities?: string[];
  irrelevantEntities?: string[];
  timestamp: number;
}
