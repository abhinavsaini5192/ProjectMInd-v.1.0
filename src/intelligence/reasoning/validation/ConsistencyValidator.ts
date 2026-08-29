import { ReasoningResult } from '../models/ReasoningResult';

export class ConsistencyValidator {
  public validate(result: Partial<ReasoningResult>): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    const statements = (result.conclusions || []).map(c => c.statement.toLowerCase());

    // Check for contradictory conclusions
    for (let i = 0; i < statements.length; i++) {
      for (let j = i + 1; j < statements.length; j++) {
        if (this.isContradiction(statements[i]!, statements[j]!)) {
          issues.push(`Contradictory conclusions detected: "${statements[i]}" vs "${statements[j]}"`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  private isContradiction(a: string, b: string): boolean {
    // Detect clear affirmative vs negative assertion on same subject
    if (a.includes('not depend on') && b.includes('directly depends on')) return true;
    if (a.includes('directly depends on') && b.includes('not depend on')) return true;
    if (a.includes('is disabled') && b.includes('is enabled')) return true;
    if (a.includes('is enabled') && b.includes('is disabled')) return true;
    return false;
  }
}
