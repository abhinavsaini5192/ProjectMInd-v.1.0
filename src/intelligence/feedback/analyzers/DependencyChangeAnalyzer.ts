import { ChangeRecord } from '../models/ChangeRecord';
import { ExecutionObservation } from '../models/ExecutionObservation';

export class DependencyChangeAnalyzer {
  public analyze(obs: ExecutionObservation): ChangeRecord[] {
    const records: ChangeRecord[] = [];

    // Track package or module configuration changes
    for (const file of obs.changedFiles || []) {
      if (file.endsWith('package.json') || file.endsWith('tsconfig.json')) {
        records.push({
          resourceId: file,
          resourceType: 'DEPENDENCY',
          operation: 'DEPENDENCY_CHANGED',
          source: 'DependencyChangeAnalyzer',
          executionId: obs.executionId,
          confidence: 1.0
        });
      }
    }

    return records;
  }
}
