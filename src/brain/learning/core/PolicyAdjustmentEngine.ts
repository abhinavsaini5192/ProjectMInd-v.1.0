import { LearningRecord } from '../models/LearningRecord';

export class PolicyAdjustmentEngine {
  public adjustPolicy(record: LearningRecord): string {
     // Mock policy adjustment based on regressions and missing context
     // In reality this would adjust a persistent JSON policy file.
     if (record.regressions.length > 0) {
        return 'v1.1-adjusted-regressions';
     }
     
     if (record.contextUtility.missing.length > 0) {
        return 'v1.1-adjusted-missing-context';
     }

     return record.policyVersion; // Unchanged
  }
}
