export interface EvidencePackage {
  taskId: string;
  intent: string;
  candidates: string[];
  metadata: Record<string, any>;
}

export class EvidencePackageBuilder {
  
  // In a real system, this takes the deterministic candidates from L3.2 and L2.
  public buildPackage(taskId: string, intent: string, deterministicCandidates: { entityId: string, score: number }[]): EvidencePackage {
    
    // We only send the top N candidates to the SLM to prevent token explosion
    const sorted = [...deterministicCandidates].sort((a, b) => b.score - a.score);
    const topCandidates = sorted.slice(0, 50).map(c => c.entityId);

    return {
      taskId,
      intent,
      candidates: topCandidates,
      metadata: {
         // E.g. architecture rules, recent changes connected to these candidates
      }
    };
  }
}
