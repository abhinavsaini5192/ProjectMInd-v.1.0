import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class HistoryBehaviorSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'HISTORY_BEHAVIOR_SOURCE';
  public readonly sourceType = 'EVOLUTIONARY';
  public readonly priority = 60;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    const gitHistory = context.extraction?.gitHistory || [];
    if (gitHistory.length === 0) {
      return candidates;
    }

    const mappedFiles = BehaviorSourceHelper.getMappedResourcesByType(context.mappings, 'FILE').map(
      m => m.resourceId
    );

    for (const commit of gitHistory) {
      const changedFiles: string[] = commit.files || commit.changedFiles || [];
      const overlap = changedFiles.filter(f => mappedFiles.some(mf => mf.includes(f) || f.includes(mf)));

      if (overlap.length >= 2) {
        const ev = BehaviorSourceHelper.createEvidence(
          this.sourceType,
          this.sourceId,
          'CO_CHANGE_BEHAVIORAL_COUPLING',
          `Co-changed in commit ${commit.hash || commit.id || 'history'}: ${overlap.slice(0, 3).join(', ')}`,
          0.75,
          { commitHash: commit.hash, files: overlap }
        );

        const nodes = overlap.slice(0, 4).map(file =>
          BehaviorSourceHelper.createNode(
            file,
            'FILE',
            'FUNCTION',
            `History Co-Change: ${file}`,
            { commitHash: commit.hash },
            0.75
          )
        );

        candidates.push(
          BehaviorSourceHelper.createCandidate(
            featureId,
            `Co-Change History: ${commit.message ? BehaviorSourceHelper.sanitize(commit.message.slice(0, 40)) : 'Commit'}`,
            'PRIMARY',
            nodes,
            [],
            [ev],
            this.sourceId,
            0.75,
            { commitHash: commit.hash }
          )
        );
      }
    }

    return candidates;
  }
}
