import type { MappingResourceType } from '../../mapping/models/MappingResourceType.js';

export type ChangeTargetType =
  | MappingResourceType
  | 'FEATURE';

export interface ChangeTarget {
  targetId: string;
  targetType: ChangeTargetType;
  name?: string | undefined;
  filePath?: string | undefined;
  symbolName?: string | undefined;
  featureId?: string | undefined;
  metadata?: Record<string, any> | undefined;
}
