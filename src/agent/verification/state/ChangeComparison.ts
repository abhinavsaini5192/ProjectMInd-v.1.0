import { RepositorySnapshot } from './RepositorySnapshot';

export interface ComparisonResult {
  expectedChanges: string[];
  missingChanges: string[];
  unexpectedChanges: string[];
}

export class ChangeComparison {
  public compare(before: RepositorySnapshot, after: RepositorySnapshot, expectedFiles: string[]): ComparisonResult {
    const missing: string[] = [];
    const unexpected: string[] = [];
    const expected: string[] = [];

    // Find missing expected files
    for (const file of expectedFiles) {
       const bState = before.files.get(file);
       const aState = after.files.get(file);
       
       if (bState?.hash === aState?.hash) {
          missing.push(file); // Hash didn't change
       } else {
          expected.push(file);
       }
    }

    // Find unexpected files
    for (const [file, aState] of after.files.entries()) {
       if (!expectedFiles.includes(file)) {
          const bState = before.files.get(file);
          if (bState?.hash !== aState.hash) {
             unexpected.push(file);
          }
       }
    }

    return {
      expectedChanges: expected,
      missingChanges: missing,
      unexpectedChanges: unexpected
    };
  }
}
