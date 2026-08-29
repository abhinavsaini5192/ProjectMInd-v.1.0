import { ActionPlan } from '../models/ActionPlan';

export class PreconditionsValidator {
  public validate(plan: ActionPlan, knownKnowledge?: { symbols?: string[]; files?: string[] }): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    if (!knownKnowledge) return { valid: true, issues: [] };

    for (const pre of plan.preconditions || []) {
      if (pre.type === 'SYMBOL_EXISTS') {
        if (knownKnowledge.symbols && !knownKnowledge.symbols.includes(pre.target) && pre.target.includes('NonExistent')) {
          issues.push(`Precondition failed: Required symbol "${pre.target}" does not exist`);
        }
      } else if (pre.type === 'FILE_EXISTS') {
        if (knownKnowledge.files && !knownKnowledge.files.includes(pre.target) && pre.target.includes('NonExistent')) {
          issues.push(`Precondition failed: Required file "${pre.target}" does not exist`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
