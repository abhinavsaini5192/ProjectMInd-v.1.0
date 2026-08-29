import { ExecutionState } from './ExecutionState';
import { ActionResult } from './ActionResult';

export interface ExecutionResult {
  executionId: string;
  taskId: string;
  planId: string;
  status: ExecutionState;
  actions: ActionResult[];
  succeeded: number;
  failed: number;
  blocked: number;
  cancelled: number;
  duration: number;
  changes: string[];
  warnings: string[];
  errors: string[];
}
