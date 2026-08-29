export interface KnowledgeGap {
  id: string;
  description: string;
  targetEntityId?: string; // If a specific symbol/feature is missing info
  criticality: 'LOW' | 'MEDIUM' | 'HIGH';
}
