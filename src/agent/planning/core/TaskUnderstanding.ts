import { TaskIntent } from '../models/TaskPlan';

export interface UnderstandingResult {
  objective: string;
  intent: TaskIntent;
  feature?: string;
  scope: string[];
  constraints: string[];
  expectedOutcome: string;
  ambiguity: boolean;
  confidence: number;
}

export class TaskUnderstanding {
  
  public understand(request: string): UnderstandingResult {
    // In reality this would route through the Brain/SLM.
    // For this implementation, we do rudimentary keyword parsing.
    let intent = TaskIntent.UNKNOWN;
    if (request.toLowerCase().includes('fix') || request.toLowerCase().includes('bug')) {
       intent = TaskIntent.BUG_FIX;
    } else if (request.toLowerCase().includes('add') || request.toLowerCase().includes('feature')) {
       intent = TaskIntent.FEATURE;
    } else if (request.toLowerCase().includes('refactor')) {
       intent = TaskIntent.REFACTOR;
    }

    return {
      objective: request,
      intent,
      scope: [], // Will be filled by ScopeAnalyzer
      constraints: [],
      expectedOutcome: 'Task completed successfully',
      ambiguity: false,
      confidence: intent !== TaskIntent.UNKNOWN ? 0.9 : 0.4
    };
  }
}
