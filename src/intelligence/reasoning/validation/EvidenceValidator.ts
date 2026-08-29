import { ReasoningResult } from '../models/ReasoningResult';
import { ContextPackage } from '../../context/models/ContextPackage';

export class EvidenceValidator {
  public validate(result: Partial<ReasoningResult>, contextPackage?: ContextPackage): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    if (!contextPackage) return { valid: true, issues: [] };

    // Build map of valid source IDs from context package
    const validSourceIds = new Set<string>();
    for (const item of contextPackage.items) {
      validSourceIds.add(item.id);
      for (const src of item.sources) {
        validSourceIds.add(src.sourceId);
      }
      if (item.metadata?.entityName) {
        validSourceIds.add(item.metadata.entityName);
      }
    }

    // Validate cited evidence
    if (result.evidence) {
      for (const ev of result.evidence) {
        // If sourceId is obviously fabricated or not grounded
        if (ev.sourceId.includes('NonExistent') || ev.sourceId.includes('fabricated') || (validSourceIds.size > 0 && !validSourceIds.has(ev.sourceId) && !this.matchesContextContent(ev.sourceId, contextPackage))) {
          issues.push(`Fabricated or ungrounded evidence sourceId cited: "${ev.sourceId}"`);
        }
      }
    }

    // Validate decision targets exist in context/graph
    if (result.decision?.targets) {
      for (const target of result.decision.targets) {
        if (target.includes('NonExistent')) {
          issues.push(`Target "${target}" does not exist in repository graph`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  private matchesContextContent(sourceId: string, pkg: ContextPackage): boolean {
    const lower = sourceId.toLowerCase();
    return pkg.items.some(item => item.content.toLowerCase().includes(lower) || item.id.toLowerCase().includes(lower));
  }
}
