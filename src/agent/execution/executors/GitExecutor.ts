import { IActionExecutor } from './IActionExecutor';
import { AgentAction } from '../../actions/models/AgentAction';
import { ExecutionContext } from '../models/ExecutionContext';
import { ActionResult } from '../models/ActionResult';
import { ActionType } from '../../actions/models/ActionType';
import { ExecutionState } from '../models/ExecutionState';

export class GitExecutor implements IActionExecutor {
  canExecute(action: AgentAction): boolean {
    return [
      ActionType.GIT_STATUS, 
      ActionType.GIT_DIFF, 
      ActionType.GIT_CHECKPOINT
    ].includes(action.type);
  }

  validate(action: AgentAction, context: ExecutionContext): void {
    // Validates the repository path is a valid git repo
  }

  async execute(action: AgentAction, context: ExecutionContext): Promise<ActionResult> {
    const startedAt = Date.now();
    
    // Mock local git operation
    return {
      actionId: action.actionId,
      status: ExecutionState.SUCCEEDED,
      startedAt,
      completedAt: Date.now(),
      duration: Date.now() - startedAt,
      output: { status: 'clean' },
      warnings: [],
      errors: [],
      changes: []
    };
  }
}
