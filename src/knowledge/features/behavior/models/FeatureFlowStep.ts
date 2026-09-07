export type FeatureFlowStep =
  | 'ENTRY_POINT'
  | 'VALIDATION'
  | 'AUTHORIZATION'
  | 'CONTROLLER'
  | 'HANDLER'
  | 'SERVICE'
  | 'FUNCTION'
  | 'REPOSITORY'
  | 'DATABASE'
  | 'CACHE'
  | 'EVENT'
  | 'QUEUE'
  | 'EXTERNAL_SERVICE'
  | 'TRANSFORMATION'
  | 'CONDITION'
  | 'ERROR_HANDLER'
  | 'RESPONSE'
  | 'EXIT';

export const VALID_FEATURE_FLOW_STEPS: readonly FeatureFlowStep[] = [
  'ENTRY_POINT',
  'VALIDATION',
  'AUTHORIZATION',
  'CONTROLLER',
  'HANDLER',
  'SERVICE',
  'FUNCTION',
  'REPOSITORY',
  'DATABASE',
  'CACHE',
  'EVENT',
  'QUEUE',
  'EXTERNAL_SERVICE',
  'TRANSFORMATION',
  'CONDITION',
  'ERROR_HANDLER',
  'RESPONSE',
  'EXIT',
] as const;

export function isValidFeatureFlowStep(step: string): step is FeatureFlowStep {
  return VALID_FEATURE_FLOW_STEPS.includes(step as FeatureFlowStep);
}
