import { ContextRelevance } from './ContextRelevance';

export interface ContextCandidate {
  candidateId: string;
  resourceId: string;
  resourceType: 'SYMBOL' | 'FILE' | 'MODULE' | 'DEPENDENCY' | 'CONFIGURATION' | 'TEST' | 'MEMORY' | 'WORKSPACE';
  source: string;
  content: string;
  summary?: string;
  relevance: ContextRelevance;
  confidence: number;
  recencyTimestamp?: number;
  dependencyDistance: number;
  tokenCost: number;
}
