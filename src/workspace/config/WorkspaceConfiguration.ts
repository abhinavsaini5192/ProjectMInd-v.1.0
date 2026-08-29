export interface WorkspaceConfig {
  logLevel: string;
  enableTelemetry: boolean;
  maxCacheSizeMb: number;
}

export class WorkspaceConfiguration {
  private config: WorkspaceConfig = {
    logLevel: 'INFO',
    enableTelemetry: false,
    maxCacheSizeMb: 1024
  };

  loadDefaults(): void {
    this.config = {
      logLevel: 'INFO',
      enableTelemetry: false,
      maxCacheSizeMb: 1024
    };
  }

  applyGlobalConfig(globalOverrides: Partial<WorkspaceConfig>): void {
    this.config = { ...this.config, ...globalOverrides };
  }

  applyWorkspaceConfig(workspaceOverrides: Partial<WorkspaceConfig>): void {
    this.config = { ...this.config, ...workspaceOverrides };
  }

  applyEnvOverrides(): void {
    if (process.env.PROJECTMIND_LOG_LEVEL) {
      this.config.logLevel = process.env.PROJECTMIND_LOG_LEVEL;
    }
    if (process.env.PROJECTMIND_TELEMETRY === 'true') {
      this.config.enableTelemetry = true;
    }
  }

  applyCLIOverrides(cliOverrides: Partial<WorkspaceConfig>): void {
    this.config = { ...this.config, ...cliOverrides };
  }

  get<K extends keyof WorkspaceConfig>(key: K): WorkspaceConfig[K] {
    return this.config[key];
  }
}

export const IWorkspaceConfigurationToken = Symbol('WorkspaceConfiguration');
