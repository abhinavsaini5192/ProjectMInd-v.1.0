import { Intent } from './Intent';
import { ContextItem } from './ContextItem';
import { Risk } from './Risk';

export interface Decision {
  decisionId: string;
  action: string;
  intent: Intent;
  targetFeatures: string[];
  
  recommendedContext: ContextItem[];
  requiredContext: ContextItem[];
  optionalContext: ContextItem[];
  excludedContext: ContextItem[];
  
  affectedFeatures: string[];
  affectedTests: string[];
  
  risk: Risk;
  confidence: number;
  reasons: string[];
}
