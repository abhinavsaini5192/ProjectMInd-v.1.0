import { RoutingDecision } from '../../slm/routing/SLMDecisionRouter';

export interface FusionContradiction {
  entityId: string;
  deterministicScore: number;
  slmScore: number;
  resolutionStrategy: 'DETERMINISTIC_OVERRIDE' | 'SLM_TRUSTED' | 'BLENDED';
  explanation: string;
}

export interface FusedEntity {
  entityId: string;
  finalScore: number;
  deterministicScore: number;
  slmScore: number;
  selected: boolean;
  explanation: string;
}

export interface FinalDecision {
  decisionId: string;
  taskId: string;
  
  fusedEntities: FusedEntity[];
  contradictions: FusionContradiction[];
  
  routingStrategy: RoutingDecision;
  trustCalibrationFactor: number;
  
  deterministicWeightApplied: number;
  slmWeightApplied: number;
  
  timestamp: number;
  brainVersion: string;
  slmVersionUsed?: string;
}
