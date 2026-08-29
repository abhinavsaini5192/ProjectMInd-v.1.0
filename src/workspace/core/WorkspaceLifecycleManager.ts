import { WorkspaceStatus } from '../models/WorkspaceStatus';
import { IEventBus } from '../interfaces/IEventBus';
import { WorkspaceEvents } from '../types/WorkspaceEvents';
import { LifecycleError } from '../errors';
import { ILogger } from '../interfaces/ILogger';

export class WorkspaceLifecycleManager {
  private validTransitions: Record<WorkspaceStatus, WorkspaceStatus[]> = {
    [WorkspaceStatus.Uninitialized]: [WorkspaceStatus.Initializing],
    [WorkspaceStatus.Initializing]: [WorkspaceStatus.Ready, WorkspaceStatus.Deleted],
    [WorkspaceStatus.Ready]: [WorkspaceStatus.Analyzing, WorkspaceStatus.Repairing, WorkspaceStatus.Archived, WorkspaceStatus.Deleted, WorkspaceStatus.Migrating],
    [WorkspaceStatus.Analyzing]: [WorkspaceStatus.Ready, WorkspaceStatus.Updating],
    [WorkspaceStatus.Updating]: [WorkspaceStatus.Ready],
    [WorkspaceStatus.Repairing]: [WorkspaceStatus.Ready, WorkspaceStatus.Deleted],
    [WorkspaceStatus.Migrating]: [WorkspaceStatus.Ready, WorkspaceStatus.Deleted],
    [WorkspaceStatus.Archived]: [WorkspaceStatus.Ready, WorkspaceStatus.Deleted],
    [WorkspaceStatus.Deleted]: []
  };

  constructor(
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  transition(repositoryId: string, currentState: WorkspaceStatus, nextState: WorkspaceStatus): WorkspaceStatus {
    const allowed = this.validTransitions[currentState];
    if (!allowed || !allowed.includes(nextState)) {
      this.logger.error({ component: 'WorkspaceLifecycleManager', operation: 'transition', repositoryId, message: `Invalid state transition from ${currentState} to ${nextState}`, severity: 'ERROR' });
      throw new LifecycleError(`Invalid lifecycle transition from ${currentState} to ${nextState}`);
    }

    this.logger.info({ component: 'WorkspaceLifecycleManager', operation: 'transition', repositoryId, message: `Transitioning ${currentState} -> ${nextState}`, severity: 'INFO' });
    
    // In a real implementation we would persist the state change here to IRegistryStore
    
    this.eventBus.publish(WorkspaceEvents.WorkspaceValidated, { repositoryId, oldState: currentState, newState: nextState });
    return nextState;
  }
}

export const IWorkspaceLifecycleManagerToken = Symbol('WorkspaceLifecycleManager');
