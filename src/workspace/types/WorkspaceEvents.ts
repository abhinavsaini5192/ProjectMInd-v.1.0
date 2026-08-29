export enum WorkspaceEvents {
  WorkspaceCreated = 'workspace.created',
  WorkspaceLoaded = 'workspace.loaded',
  WorkspaceOpened = 'workspace.opened',
  WorkspaceClosed = 'workspace.closed',
  RepositoryRegistered = 'repository.registered',
  RepositoryRemoved = 'repository.removed',
  WorkspaceValidated = 'workspace.validated',
  WorkspaceRecovered = 'workspace.recovered',
  WorkspaceUpgraded = 'workspace.upgraded',
  ConfigurationChanged = 'configuration.changed',
  HealthCheckCompleted = 'health.completed'
}

export interface ProjectMindEvent<T = any> {
  name: WorkspaceEvents | string;
  payload: T;
  timestamp: string;
}
