import { BrainState } from './BrainState';
import { BrainDecision } from './BrainDecision';

export interface BrainSession {
  sessionId: string;
  taskId: string;
  repositoryId: string;
  workspaceId: string;
  state: BrainState;
  queries: string[];
  context: any; // Context assembled from Knowledge Graph & Memory
  reasoningRequests: any[];
  reasoningResponses: any[];
  decisions: BrainDecision[];
  confidence: number;
  createdAt: number;
  updatedAt: number;
}
