import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspaceLifecycleManager } from '../../src/workspace/core/WorkspaceLifecycleManager';
import { NodeEventBus } from '../../src/workspace/events/NodeEventBus';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import { WorkspaceStatus } from '../../src/workspace/models/WorkspaceStatus';
import { LifecycleError } from '../../src/workspace/errors';

describe('WorkspaceLifecycleManager', () => {
  let manager: WorkspaceLifecycleManager;
  let eventBus: NodeEventBus;
  let logger: StructuredLogger;

  beforeEach(() => {
    eventBus = new NodeEventBus();
    logger = new StructuredLogger();
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    manager = new WorkspaceLifecycleManager(eventBus, logger);
  });

  it('should allow valid transitions', () => {
    const nextState = manager.transition('repo-1', WorkspaceStatus.Uninitialized, WorkspaceStatus.Initializing);
    expect(nextState).toBe(WorkspaceStatus.Initializing);
  });

  it('should throw on invalid transitions', () => {
    expect(() => 
      manager.transition('repo-1', WorkspaceStatus.Uninitialized, WorkspaceStatus.Ready)
    ).toThrowError(LifecycleError);
  });

  it('should publish an event on successful transition', () => {
    const spy = vi.spyOn(eventBus, 'publish');
    manager.transition('repo-1', WorkspaceStatus.Uninitialized, WorkspaceStatus.Initializing);
    expect(spy).toHaveBeenCalled();
  });
});
