export type FeatureResourceType =
  | 'FILE'
  | 'SYMBOL'
  | 'MODULE'
  | 'PACKAGE'
  | 'DEPENDENCY'
  | 'RELATIONSHIP'
  | 'CONFIGURATION'
  | 'TEST'
  | 'DATABASE'
  | 'ENDPOINT'
  | 'COMMAND'
  | 'UI_COMPONENT';

export type FeatureReferenceRole =
  | 'ENTRY_POINT'
  | 'IMPLEMENTATION'
  | 'SUPPORT'
  | 'DEPENDENCY'
  | 'CONFIGURATION'
  | 'STORAGE'
  | 'TEST'
  | 'UI'
  | 'API'
  | 'DOCUMENTATION'
  | 'VERIFICATION'
  | 'OBSERVABILITY';

export interface FeatureReference {
  referenceId: string;
  resourceType: FeatureResourceType;
  resourceId: string;
  role: FeatureReferenceRole;
  confidence: number;
  source?: string;
}
