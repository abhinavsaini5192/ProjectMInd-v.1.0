import { ContextRequirement } from '../models/ContextRequirement';
import { InformationGap } from '../models/InformationGap';
import { ContextQuery } from '../models/ContextQuery';

export class ContextQueryPlanner {
  public planQueries(requirements: ContextRequirement[], gaps: InformationGap[]): ContextQuery[] {
    const queries: ContextQuery[] = [];
    const seenTargets = new Set<string>();

    // 1. Plan queries for requirements
    for (const req of requirements) {
      for (const kw of req.targetKeywords) {
        if (!seenTargets.has(kw)) {
          seenTargets.add(kw);
          queries.push({
            queryId: `query_${req.subtaskId}_${kw}`,
            subtaskId: req.subtaskId,
            type: 'SYMBOL',
            queryTarget: kw,
            reason: `Required to satisfy context requirement: ${req.description}`,
            priority: req.priority === 'CRITICAL' ? 1 : req.priority === 'HIGH' ? 2 : 3,
            expectedInformationGain: 0.85
          });
        }
      }
    }

    // 2. Plan high-priority queries to resolve blocking information gaps
    for (const gap of gaps) {
      if (!gap.resolved && !seenTargets.has(gap.gapId)) {
        seenTargets.add(gap.gapId);
        queries.push({
          queryId: `query_gap_${gap.gapId}`,
          subtaskId: gap.subtaskId,
          type: 'CONFIGURATION',
          queryTarget: gap.description,
          reason: `High-priority query to resolve blocking information gap: ${gap.description}`,
          priority: 1,
          expectedInformationGain: 0.95
        });
      }
    }

    return queries.sort((a, b) => a.priority - b.priority);
  }
}
