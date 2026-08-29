import { ContextGraphNode } from '../models/ContextGraph';
import { IntentType } from '../../decision/models/Intent';

export class TaskPolicyEngine {
  public applyPolicy(nodes: ContextGraphNode[], intentType: IntentType): void {
     for (const node of nodes) {
       if (intentType === IntentType.BUG_FIX && node.type === 'TEST') {
          node.data.relevance = Math.min(1.0, node.data.relevance + 0.3);
       }
       if (intentType === IntentType.FEATURE_ADD && node.type === 'ARCHITECTURE') {
          node.data.relevance = Math.min(1.0, node.data.relevance + 0.3);
       }
     }
  }
}
