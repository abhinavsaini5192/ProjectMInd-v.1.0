export interface ContextRequirement {
  requirementId: string;
  subtaskId: string;
  description: string;
  resourceTypes: Array<'SYMBOL' | 'FILE' | 'MODULE' | 'DEPENDENCY' | 'CONFIGURATION' | 'TEST' | 'MEMORY' | 'WORKSPACE'>;
  targetKeywords: string[];
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mandatory: boolean;
}
