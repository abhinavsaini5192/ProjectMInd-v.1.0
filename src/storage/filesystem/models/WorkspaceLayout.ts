export const GlobalWorkspaceLayout = [
  'config',
  'registry',
  'plugins',
  'models',
  'datasets',
  'benchmarks',
  'cache',
  'logs',
  'runtime',
  'backups',
  'snapshots',
  'workspaces'
] as const;

export const RepositoryWorkspaceLayout = [
  'metadata',
  'state',
  'context',
  'research',
  'cache',
  'logs',
  'snapshots',
  'exports',
  'databases',
  'temp'
] as const;
