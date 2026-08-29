export enum ChangeClassification {
  Feature = 'Feature',
  BugFix = 'Bug Fix',
  Refactor = 'Refactor',
  Documentation = 'Documentation',
  Configuration = 'Configuration',
  Dependency = 'Dependency Update',
  Test = 'Test',
  Security = 'Security',
  Performance = 'Performance',
  Architecture = 'Architecture',
  Build = 'Build',
  CICD = 'CI/CD',
  Migration = 'Migration',
  Unknown = 'Unknown'
}

export enum RefactorType {
  Rename = 'Rename',
  Move = 'Move',
  ExtractMethod = 'Extract Method',
  InlineMethod = 'Inline Method',
  SplitModule = 'Split Module',
  MergeModule = 'Merge Module',
  ExtractClass = 'Extract Class',
  RenameFeature = 'Rename Feature'
}
