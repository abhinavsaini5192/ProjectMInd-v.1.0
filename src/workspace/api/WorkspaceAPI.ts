import { WorkspaceService } from './services/WorkspaceService';
import { RegistryService } from './services/RegistryService';
import { HealthService } from './services/HealthService';
import { ConfigurationService } from './services/ConfigurationService';
import { LifecycleService } from './services/LifecycleService';

/**
 * The WorkspaceAPI is the ONLY public interface for ProjectMind runtime modules.
 * No runtime component should instantiate or import Workspace Core classes directly.
 */
export class WorkspaceAPI {
  constructor(
    public readonly workspace: WorkspaceService,
    public readonly registry: RegistryService,
    public readonly health: HealthService,
    public readonly config: ConfigurationService,
    public readonly lifecycle: LifecycleService
  ) {}
}

export const IWorkspaceAPIToken = Symbol('WorkspaceAPI');
