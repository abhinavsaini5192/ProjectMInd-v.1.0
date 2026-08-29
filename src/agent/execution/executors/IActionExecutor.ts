import { AgentAction } from '../../actions/models/AgentAction';
import { ExecutionContext } from '../models/ExecutionContext';
import { ActionResult } from '../models/ActionResult';

export interface IActionExecutor {
  canExecute(action: AgentAction): boolean;
  validate(action: AgentAction, context: ExecutionContext): void;
  execute(action: AgentAction, context: ExecutionContext): Promise<ActionResult>;
}
