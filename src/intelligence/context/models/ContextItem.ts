import { ContextType } from './ContextType';
import { ContextSource } from './ContextSource';

export interface ContextItem {
  id: string;
  type: ContextType;
  content: string;
  sources: ContextSource[];
  relevance: number;
  confidence: number;
  priority: number; // 1 = highest, 10 = lowest
  tokenEstimate: number;
  metadata?: Record<string, any>;
  lastVerified?: number;
}
