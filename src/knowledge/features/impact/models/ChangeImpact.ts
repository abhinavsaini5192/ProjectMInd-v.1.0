import type { ChangeTarget } from './ChangeTarget.js';
import type { ChangeType } from './ChangeType.js';

export interface ChangeImpact {
  changeId: string;
  target: ChangeTarget;
  changeType: ChangeType;
  diffSnippet?: string | undefined;
  previousState?: any;
  newState?: any;
  description?: string | undefined;
  timestamp: number;
  metadata?: Record<string, any> | undefined;
}
