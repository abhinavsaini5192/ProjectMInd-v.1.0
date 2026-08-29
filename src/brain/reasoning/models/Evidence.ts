export interface Evidence {
  id: string;
  type: 'TASK_MENTION' | 'FEATURE_MATCH' | 'RELATIONSHIP' | 'DEPENDENCY' | 'RECENT_CHANGE' | 'CONTRADICTION' | 'UNKNOWN';
  sourceId: string; // The ID of the feature, symbol, or task
  description: string;
  confidenceContribution: number; // e.g., +0.4 or -0.2
  timestampMs?: number;
}
