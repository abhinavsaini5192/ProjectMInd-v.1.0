import { ChangeRecord } from '../models/ChangeRecord';
import { ExecutionObservation } from '../models/ExecutionObservation';

export class SymbolChangeAnalyzer {
  public analyze(obs: ExecutionObservation): ChangeRecord[] {
    const records: ChangeRecord[] = [];

    // Map changed files to potential symbol entities
    for (const file of obs.changedFiles || []) {
      const match = file.match(/\/([A-Z][a-zA-Z0-9]+)\.(ts|js)/);
      if (match && match[1]) {
        const symbolId = `sym_${match[1]}`;
        records.push({
          resourceId: symbolId,
          resourceType: 'SYMBOL',
          operation: 'MODIFIED',
          source: file,
          executionId: obs.executionId,
          confidence: 0.9
        });
      }
    }

    return records;
  }
}
