export type FeatureRelationshipDirection =
  | 'DIRECTED'
  | 'BIDIRECTIONAL'
  | 'UNDIRECTED';

export const ALL_FEATURE_RELATIONSHIP_DIRECTIONS: readonly FeatureRelationshipDirection[] = [
  'DIRECTED',
  'BIDIRECTIONAL',
  'UNDIRECTED',
] as const;

export function isValidFeatureRelationshipDirection(direction: string): direction is FeatureRelationshipDirection {
  return ALL_FEATURE_RELATIONSHIP_DIRECTIONS.includes(direction as FeatureRelationshipDirection);
}
