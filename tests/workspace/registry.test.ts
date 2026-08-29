import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspaceRegistry } from '../../src/workspace/core/WorkspaceRegistry';
import { InMemoryRegistryStore } from '../mocks/storage/InMemoryRegistryStore';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import { RegistryError } from '../../src/workspace/errors';

describe('WorkspaceRegistry', () => {
  let registry: WorkspaceRegistry;
  let store: InMemoryRegistryStore;
  let logger: StructuredLogger;

  beforeEach(() => {
    store = new InMemoryRegistryStore();
    logger = new StructuredLogger();
    // silence the logger for tests
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    registry = new WorkspaceRegistry(store, logger);
  });

  it('should register a new repository', async () => {
    const repo = { id: 'uuid-1', path: '/test/path', createdAt: '2026-08-04', status: 'Active' };
    await registry.registerRepository(repo);
    const fetched = await registry.getRepository('uuid-1');
    expect(fetched).toEqual(repo);
  });

  it('should throw RegistryError when registering duplicate ID', async () => {
    const repo = { id: 'uuid-1', path: '/test/path', createdAt: '2026-08-04', status: 'Active' };
    await registry.registerRepository(repo);
    await expect(registry.registerRepository(repo)).rejects.toThrowError(RegistryError);
  });

  it('should list all registered repositories', async () => {
    const repo1 = { id: 'uuid-1', path: '/test/path1', createdAt: '2026-08-04', status: 'Active' };
    const repo2 = { id: 'uuid-2', path: '/test/path2', createdAt: '2026-08-04', status: 'Active' };
    await registry.registerRepository(repo1);
    await registry.registerRepository(repo2);
    
    const all = await registry.listRepositories();
    expect(all).toHaveLength(2);
  });
});
