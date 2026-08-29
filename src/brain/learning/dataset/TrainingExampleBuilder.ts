import { LearningRecord } from '../models/LearningRecord';
import { TrainingExample } from '../models/TrainingExample';
import { DatasetEligibilityValidator } from './DatasetEligibilityValidator';
import { PrivacyFilter } from './PrivacyFilter';
import crypto from 'crypto';

export class TrainingExampleBuilder {
  constructor(
    private validator: DatasetEligibilityValidator,
    private privacyFilter: PrivacyFilter
  ) {}

  public build(record: LearningRecord): TrainingExample | null {
    if (!this.validator.validate(record)) {
       return null;
    }

    const sanitizedTask = this.privacyFilter.filter(record.task);

    // SLM Target: Given the task, what context should have been provided?
    // We combine what the Brain provided (that was useful) with what the agent had to find on its own (missing)
    const targetContextIds = [
       ...record.contextUtility.useful,
       ...record.contextUtility.missing
    ];

    return {
       exampleId: crypto.randomUUID(),
       decisionId: record.decisionId,
       input: {
         task: sanitizedTask,
         repositoryStateSummary: 'repo_graph_representation_placeholder' // In practice, would fetch from L2 snapshot
       },
       output: {
         recommendedContextIds: [...new Set(targetContextIds)]
       },
       metadata: {
         decisionScore: record.decisionQualityScore,
         timestamp: Date.now()
       }
    };
  }
}
