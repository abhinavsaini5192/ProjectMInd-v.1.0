import { Intent, IntentType } from '../models/Intent';

export class IntentAnalyzer {
  public analyze(task: string): Intent {
    const lower = task.toLowerCase();
    
    let type = IntentType.UNKNOWN;
    let confidence = 0.5;

    if (lower.includes('bug') || lower.includes('fix') || lower.includes('error') || lower.includes('crash')) {
      type = IntentType.BUG_FIX;
      confidence = 0.9;
    } else if (lower.includes('add') || lower.includes('create') || lower.includes('implement')) {
      type = IntentType.FEATURE_ADD;
      confidence = 0.85;
    } else if (lower.includes('refactor') || lower.includes('clean') || lower.includes('restructure')) {
      type = IntentType.REFACTOR;
      confidence = 0.88;
    } else if (lower.includes('remove') || lower.includes('delete') || lower.includes('deprecate')) {
      type = IntentType.FEATURE_REMOVE;
      confidence = 0.9;
    } else if (lower.includes('modify') || lower.includes('update') || lower.includes('change')) {
      type = IntentType.FEATURE_MODIFY;
      confidence = 0.75;
    }

    return { type, confidence };
  }
}
