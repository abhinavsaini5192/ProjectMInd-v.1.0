export interface CommitSnapshot {
  commitHash: string;
  author: string;
  timestamp: number;
  message: string;
  changedFiles: string[];
  addedSymbolIds: string[];
  removedSymbolIds: string[];
  modifiedSymbolIds: string[];
  addedDependencyIds: string[];
  removedDependencyIds: string[];
  addedFeatureIds: string[];
  removedFeatureIds: string[];
}
