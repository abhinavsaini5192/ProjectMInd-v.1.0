export type FeatureRelationshipType =
  | 'DEPENDS_ON'
  | 'REQUIRED_BY'
  | 'PROVIDES'
  | 'CONSUMES'
  | 'USES'
  | 'INTEGRATES_WITH'
  | 'EXTENDS'
  | 'SPECIALIZES'
  | 'COMPOSES'
  | 'COORDINATES'
  | 'SHARES_RESOURCE'
  | 'SHARES_DATA'
  | 'AUTHORIZES'
  | 'TRIGGERS'
  | 'FEEDS'
  | 'OBSERVES'
  | 'VERIFIES'
  | 'ASSOCIATED_WITH';

export const ALL_FEATURE_RELATIONSHIP_TYPES: readonly FeatureRelationshipType[] = [
  'DEPENDS_ON',
  'REQUIRED_BY',
  'PROVIDES',
  'CONSUMES',
  'USES',
  'INTEGRATES_WITH',
  'EXTENDS',
  'SPECIALIZES',
  'COMPOSES',
  'COORDINATES',
  'SHARES_RESOURCE',
  'SHARES_DATA',
  'AUTHORIZES',
  'TRIGGERS',
  'FEEDS',
  'OBSERVES',
  'VERIFIES',
  'ASSOCIATED_WITH',
] as const;

export const VALID_FEATURE_RELATIONSHIP_TYPES = ALL_FEATURE_RELATIONSHIP_TYPES;

export function isValidFeatureRelationshipType(type: string): type is FeatureRelationshipType {
  return ALL_FEATURE_RELATIONSHIP_TYPES.includes(type as FeatureRelationshipType);
}
