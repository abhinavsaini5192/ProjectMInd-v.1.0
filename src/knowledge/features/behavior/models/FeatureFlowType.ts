export type FeatureFlowType =
  | 'PRIMARY'
  | 'ALTERNATIVE'
  | 'FAILURE'
  | 'VALIDATION'
  | 'AUTHORIZATION'
  | 'DATA'
  | 'API'
  | 'EVENT'
  | 'ASYNC'
  | 'INTEGRATION'
  | 'TRANSACTION'
  | 'OBSERVABILITY';

export const VALID_FEATURE_FLOW_TYPES: readonly FeatureFlowType[] = [
  'PRIMARY',
  'ALTERNATIVE',
  'FAILURE',
  'VALIDATION',
  'AUTHORIZATION',
  'DATA',
  'API',
  'EVENT',
  'ASYNC',
  'INTEGRATION',
  'TRANSACTION',
  'OBSERVABILITY',
] as const;

export function isValidFeatureFlowType(type: string): type is FeatureFlowType {
  return VALID_FEATURE_FLOW_TYPES.includes(type as FeatureFlowType);
}
