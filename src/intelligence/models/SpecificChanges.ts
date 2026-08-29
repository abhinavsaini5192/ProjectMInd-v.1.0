import { RepositoryChange, ASTChange } from './RepositoryChange';

export interface ArchitectureChange {
  violationDetected: boolean;
  layerCrossed?: string;
  circularDependencyAdded: boolean;
  affectedModules: string[];
}

export interface FeatureChange {
  featureName: string;
  relatedFiles: string[];
  isNew: boolean;
}

export interface DependencyChange {
  dependencyName: string;
  oldVersion?: string;
  newVersion?: string;
  isAdded: boolean;
  isRemoved: boolean;
}

export interface BreakingChange {
  symbolName: string;
  filePath: string;
  reason: string;
  consumersAffected: string[]; // downstream symbols/files impacted
}

export interface Refactor {
  description: string;
  filesInvolved: string[];
  isPure: boolean; // True if signature/behavior hasn't changed externally
}
