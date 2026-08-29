export enum SemanticEventType {
  FeatureAdded = 'FeatureAdded',
  FeatureRemoved = 'FeatureRemoved',
  BugFixed = 'BugFixed',
  Refactored = 'Refactored',
  BreakingChange = 'BreakingChange',
  ArchitectureChanged = 'ArchitectureChanged',
  DependencyUpdated = 'DependencyUpdated',
  TaskCompleted = 'TaskCompleted',
  Unknown = 'Unknown'
}

export interface SemanticEvent {
  id: string;
  type: SemanticEventType;
  timestamp: string;
  description: string;
  confidence: number;
  metadata: Record<string, any>;
  impact: string[]; // List of affected node IDs or file paths
}
