import { ActionType } from './ActionType';

export interface AgentAction {
  readonly actionId: string;
  readonly taskId: string;
  readonly planId: string;
  readonly stepId: string;
  
  readonly type: ActionType;
  readonly target: string; // The file, symbol, or logical target
  readonly parameters: Record<string, any>;
  
  readonly dependencies: string[]; // actionIds this action depends on
  readonly preconditions: string[]; // logical preconditions that must be met
  readonly expectedOutcome: string;
  
  readonly provenance: string; // "Brain-derived", "SLM-suggested", etc
  readonly risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly confidence: number;
  readonly createdAt: number;
}
