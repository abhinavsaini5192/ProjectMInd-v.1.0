import { ContextCandidate } from '../models/ContextCandidate';

export class MemoryAdapter {
  public async queryMemory(query: string): Promise<ContextCandidate[]> {
    return [
      {
        candidateId: `mem_${Date.now()}`,
        resourceId: 'MEMORY_JWT_CONFIG',
        resourceType: 'MEMORY',
        source: 'MEMORY',
        content: 'Project authentication uses JWT with 15-minute access token expiration.',
        summary: 'JWT Architecture decision memory',
        relevance: {
          overallScore: 0.8,
          taskRelevance: 0.8,
          structuralRelevance: 0.5,
          dependencyRelevance: 0.6,
          semanticRelevance: 0.9,
          recencyRelevance: 0.8,
          confidenceScore: 0.75,
          whyIncluded: 'Architectural context memory for authentication token policy'
        },
        confidence: 0.8,
        dependencyDistance: 2,
        tokenCost: 50
      }
    ];
  }
}
