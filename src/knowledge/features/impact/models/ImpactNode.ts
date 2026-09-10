export interface ImpactNode {
  nodeId: string;
  resourceId: string;
  resourceType: string;
  featureId?: string | undefined;
  nodeRole?: string | undefined;
  confidence: number;
  metadata?: Record<string, any> | undefined;
}
