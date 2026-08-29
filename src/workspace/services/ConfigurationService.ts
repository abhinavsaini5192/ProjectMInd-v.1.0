import { WorkspaceConfiguration, WorkspaceConfig } from '../config/WorkspaceConfiguration';

export class ConfigurationService {
  constructor(private config: WorkspaceConfiguration) {}

  get<K extends keyof WorkspaceConfig>(key: K): WorkspaceConfig[K] {
    return this.config.get(key);
  }

  applyWorkspaceOverrides(overrides: Partial<WorkspaceConfig>): void {
    this.config.applyWorkspaceConfig(overrides);
  }
}

export const IConfigurationServiceToken = Symbol('ConfigurationService');
