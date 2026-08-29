import { ExecutionState } from './ExecutionState';

export interface ActionResult {
  actionId: string;
  status: ExecutionState;
  startedAt: number;
  completedAt?: number;
  duration?: number;
  output: Record<string, any>;
  warnings: string[];
  errors: string[];
  changes: string[]; // Files changed, etc.
}
