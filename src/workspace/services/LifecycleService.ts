import { WorkspaceLifecycleManager } from '../core/WorkspaceLifecycleManager';
import { WorkspaceStatus } from '../models/WorkspaceStatus';

export class LifecycleService {
  constructor(private lifecycle: WorkspaceLifecycleManager) {}

  transition(repositoryId: string, current: WorkspaceStatus, next: WorkspaceStatus): WorkspaceStatus {
    return this.lifecycle.transition(repositoryId, current, next);
  }
}

export const ILifecycleServiceToken = Symbol('LifecycleService');
