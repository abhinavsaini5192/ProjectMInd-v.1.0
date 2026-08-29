export interface ContextItem {
  entityId: string;
  type: 'symbol' | 'feature' | 'relationship' | 'dependency' | 'architecture' | 'evolution';
  category: 'REQUIRED' | 'USEFUL' | 'OPTIONAL' | 'EXCLUDED';
  relevanceScore: number;
  confidence: number;
  reason: string;
  source: string;
  estimatedTokenCost: number;
}
