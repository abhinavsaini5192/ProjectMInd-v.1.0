import { CheckResult, CheckStatus, CheckEvidence } from '../models/CheckResult';
import { ChangeComparison, ComparisonResult } from '../state/ChangeComparison';
import { RepositorySnapshot } from '../state/RepositorySnapshot';

export class FileCheck {
  public run(before: RepositorySnapshot, after: RepositorySnapshot, expectedFiles: string[]): CheckResult {
    const start = Date.now();
    const comparison = new ChangeComparison().compare(before, after, expectedFiles);
    
    let status = CheckStatus.PASS;
    const evidence: CheckEvidence[] = [];

    if (comparison.missingChanges.length > 0) {
       status = CheckStatus.FAIL;
       comparison.missingChanges.forEach(f => evidence.push({ type: 'MISSING', file: f, message: 'Expected file was not modified' }));
    }

    if (comparison.unexpectedChanges.length > 0) {
       status = status === CheckStatus.FAIL ? CheckStatus.FAIL : CheckStatus.PARTIAL;
       comparison.unexpectedChanges.forEach(f => evidence.push({ type: 'UNEXPECTED', file: f, message: 'File was unexpectedly modified' }));
    }

    return {
      checkId: `check_file_${Date.now()}`,
      type: 'FILE',
      status,
      duration: Date.now() - start,
      evidence,
      errors: status === CheckStatus.FAIL ? ['Missing expected file modifications'] : [],
      warnings: comparison.unexpectedChanges.length > 0 ? ['Unexpected file modifications detected'] : []
    };
  }
}
