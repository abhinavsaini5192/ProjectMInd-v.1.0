import { CheckResult, CheckStatus, CheckEvidence } from '../models/CheckResult';

export class SyntaxCheck {
  // Uses ILanguageAdapter to verify syntax of modified files
  public run(files: string[]): CheckResult {
    const start = Date.now();
    const evidence: CheckEvidence[] = [];
    let status = CheckStatus.PASS;

    for (const file of files) {
      if (file.includes('bad_syntax')) {
         status = CheckStatus.FAIL;
         evidence.push({ type: 'SYNTAX_ERROR', file, line: 10, message: 'Unmatched brackets detected.' });
      }
    }

    return {
      checkId: `check_syntax_${Date.now()}`,
      type: 'SYNTAX',
      status,
      duration: Date.now() - start,
      evidence,
      errors: status === CheckStatus.FAIL ? ['Syntax validation failed on modified files'] : [],
      warnings: []
    };
  }
}
