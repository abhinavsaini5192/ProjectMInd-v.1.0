import { LearningRecord } from '../models/LearningRecord';
import { Outcome } from '../models/Outcome';

export class DatasetEligibilityValidator {
  public validate(record: LearningRecord): boolean {
    // Basic heuristics for SLM training data eligibility
    if (record.outcome === Outcome.FAILED || record.outcome === Outcome.ABANDONED) return false;
    
    // Cannot train on data that caused a regression
    if (record.regressions.length > 0) return false;
    
    // If the context utility score is too low, the data isn't a good example of "what to provide"
    if (record.contextUtilityScore < 0.5) return false;
    
    // Explicit human feedback rejection
    if (record.feedback && (record.feedback.rating === 'MISLEADING_CONTEXT' || record.feedback.rating === 'WRONG_CONTEXT')) {
       return false;
    }

    return true;
  }
}
