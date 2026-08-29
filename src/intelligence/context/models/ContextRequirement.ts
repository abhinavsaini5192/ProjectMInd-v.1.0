import { ContextType } from './ContextType';
import { ContextSourceType } from './ContextSource';

export interface ContextRequirement {
  type: ContextType;
  sourceType: ContextSourceType;
  required: boolean;
  priority: number;
  query?: string;
  entities?: string[];
  maxItems?: number;
}
