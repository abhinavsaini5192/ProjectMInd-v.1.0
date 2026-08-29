export type DecisionFactorType =
  | 'EVIDENCE_STRENGTH'
  | 'DEPENDENCY_IMPACT'
  | 'ARCHITECTURE_IMPACT'
  | 'CONFIDENCE'
  | 'RISK'
  | 'USER_CONSTRAINTS'
  | 'AFFECTED_MODULES'
  | 'TEST_COVERAGE'
  | 'UNCERTAINTY';

export interface DecisionFactor {
  type: DecisionFactorType;
  value: number;
  explanation: string;
}
