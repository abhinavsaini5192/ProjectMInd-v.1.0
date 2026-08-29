import { ContextItem } from './ContextItem';
import { ContextSource } from './ContextSource';

export interface ContextConflict {
  conflictId: string;
  topic: string;
  conflictingItems: ContextItem[];
  sources: ContextSource[];
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}
