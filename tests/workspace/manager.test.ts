import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspaceManager } from '../../src/workspace/core/WorkspaceManager';
import { WorkspaceRegistry } from '../../src/workspace/core/WorkspaceRegistry';
import { WorkspaceLocator } from '../../src/workspace/core/WorkspaceLocator';
import { WorkspaceLifecycleManager } from '../../src/workspace/core/WorkspaceLifecycleManager';
import { WorkspaceHealthMonitor } from '../../src/workspace/health/WorkspaceHealthMonitor';
import { WorkspacePathResolver } from '../../src/workspace/core/WorkspacePathResolver';
import { InMemoryRegistryStore } from '../mocks/storage/InMemoryRegistryStore';
import { InMemoryWorkspaceStore } from '../mocks/storage/InMemoryWorkspaceStore';
import { NodeEventBus } from '../../src/workspace/events/NodeEventBus';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import path from 'path';

describe('WorkspaceManager', () => {
  let manager: WorkspaceManager;
  let workspaceStore: InMemoryWorkspaceStore;

  beforeEach(() => {
    const registryStore = new InMemoryRegistryStore();
    workspaceStore = new InMemoryWorkspaceStore();
    const logger = new StructuredLogger();
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    
    const eventBus = new NodeEventBus();
    const registry = new WorkspaceRegistry(registryStore, logger);
    const pathResolver = new WorkspacePathResolver();
    const locator = new WorkspaceLocator(registry, pathResolver, workspaceStore);
    const lifecycle = new WorkspaceLifecycleManager(eventBus, logger);
    const healthMonitor = new WorkspaceHealthMonitor(logger);

    manager = new WorkspaceManager(
      registry, locator, lifecycle, healthMonitor, pathResolver, workspaceStore, eventBus, logger
    );
  });

  it('should initialize a workspace and setup directories', async () => {
    const repoId = 'uuid-1';
    const repoPath = '/path/to/repo';
    
    await manager.initializeWorkspace(repoId, repoPath);
    
    const pointerPath = path.join(repoPath, '.projectmind.json');
    const pointerExists = await workspaceStore.pathExists(pointerPath);
    expect(pointerExists).toBe(true);
  });
});
