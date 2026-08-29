import { ChangeRecord } from '../models/ChangeRecord';
import { ExecutionObservation } from '../models/ExecutionObservation';

export class FileChangeAnalyzer {
  public analyze(obs: ExecutionObservation): ChangeRecord[] {
    const records: ChangeRecord[] = [];

    for (const file of obs.createdFiles || []) {
      records.push({
        resourceId: file,
        resourceType: 'FILE',
        operation: 'CREATED',
        source: 'ExecutionObservation',
        executionId: obs.executionId,
        confidence: 1.0
      });
    }

    for (const file of obs.changedFiles || []) {
      records.push({
        resourceId: file,
        resourceType: 'FILE',
        operation: 'MODIFIED',
        source: 'ExecutionObservation',
        executionId: obs.executionId,
        confidence: 1.0
      });
    }

    for (const file of obs.deletedFiles || []) {
      records.push({
        resourceId: file,
        resourceType: 'FILE',
        operation: 'DELETED',
        source: 'ExecutionObservation',
        executionId: obs.executionId,
        confidence: 1.0
      });
    }

    for (const file of obs.movedFiles || []) {
      records.push({
        resourceId: file,
        resourceType: 'FILE',
        operation: 'MOVED',
        source: 'ExecutionObservation',
        executionId: obs.executionId,
        confidence: 1.0
      });
    }

    return records;
  }
}
