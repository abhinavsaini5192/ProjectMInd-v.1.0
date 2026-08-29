import { OutcomeAnalysis } from '../models/OutcomeAnalysis';
import { ChangeSet } from '../models/ChangeSet';
import { LearningCandidate } from '../models/LearningCandidate';
import { LearningCandidateBuilder } from '../learning/LearningCandidateBuilder';
import { LearningValidator } from '../learning/LearningValidator';
import { LearningDeduplicator } from '../learning/LearningDeduplicator';
import { LearningPromoter } from '../learning/LearningPromoter';
import { LearningRejectionPolicy } from '../learning/LearningRejectionPolicy';

export interface LearningCurationResult {
  candidates: LearningCandidate[];
  promoted: LearningCandidate[];
  rejected: LearningCandidate[];
}

export class LearningCoordinator {
  private builder = new LearningCandidateBuilder();
  private validator = new LearningValidator();
  private deduplicator = new LearningDeduplicator();
  private promoter = new LearningPromoter();
  private rejectionPolicy = new LearningRejectionPolicy();

  public curateLearning(
    taskId: string,
    outcome: OutcomeAnalysis,
    changes: ChangeSet,
    existingLearning: LearningCandidate[] = []
  ): LearningCurationResult {
    const rawCandidates = this.builder.buildCandidates(taskId, outcome, changes);
    const validCandidates: LearningCandidate[] = [];
    const rejected: LearningCandidate[] = [];
    const promoted: LearningCandidate[] = [];

    // 1. Validate
    for (const cand of rawCandidates) {
      const val = this.validator.validate(cand);
      const rej = this.rejectionPolicy.shouldReject(cand);

      if (!val.valid || rej.reject) {
        rejected.push(cand);
      } else {
        validCandidates.push(cand);
      }
    }

    // 2. Deduplicate
    const { unique, duplicates } = this.deduplicator.deduplicate(validCandidates, existingLearning);
    rejected.push(...duplicates);

    // 3. Promote
    for (const cand of unique) {
      const promotedCand = this.promoter.evaluatePromotion(cand);
      if (promotedCand.promotionStatus === 'PROMOTED' || promotedCand.promotionStatus === 'CONFIRMED') {
        promoted.push(promotedCand);
      }
    }

    return {
      candidates: unique,
      promoted,
      rejected
    };
  }
}
