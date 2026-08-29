import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageManager } from '../../src/storage/core/StorageManager';
import { StorageProviderRegistry } from '../../src/storage/core/StorageProviderRegistry';
import { StorageFactory } from '../../src/storage/core/StorageFactory';
import { StorageLifecycleManager } from '../../src/storage/core/StorageLifecycleManager';
import { StorageValidator } from '../../src/storage/core/StorageValidator';
import { NodeEventBus } from '../../src/workspace/events/NodeEventBus';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import { StorageEvents } from '../../src/storage/types/StorageEvents';
import { StorageProviderType, ProviderState } from '../../src/storage/types/StorageTypes';
import { IStorageProvider } from '../../src/storage/interfaces/IStorageProvider';

describe('StorageManager', () => {
  let manager: StorageManager;
  let eventBus: NodeEventBus;

  const createMockProvider = (name: string): IStorageProvider => ({
    name,
    type: StorageProviderType.Filesystem,
    state: ProviderState.Unregistered,
    initialize: vi.fn().mockResolvedValue(undefined),
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn().mockResolvedValue(undefined),
    healthCheck: vi.fn(),
    getStatistics: vi.fn(),
    backup: vi.fn(),
    restore: vi.fn(),
    migrate: vi.fn()
  });

  beforeEach(() => {
    const registry = new StorageProviderRegistry();
    const logger = new StructuredLogger();
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    
    eventBus = new NodeEventBus();
    const factory = new StorageFactory(registry, logger);
    const lifecycle = new StorageLifecycleManager(eventBus, logger);
    const validator = new StorageValidator();

    manager = new StorageManager(registry, factory, lifecycle, validator, eventBus, logger);
  });

  it('should register a provider and emit event', () => {
    const provider = createMockProvider('fs-db');
    const spy = vi.spyOn(eventBus, 'publish');
    
    manager.registerProvider(provider);
    
    expect(spy).toHaveBeenCalledWith(StorageEvents.ProviderRegistered, { providerName: 'fs-db', type: StorageProviderType.Filesystem });
  });

  it('should initialize all providers', async () => {
    const provider1 = createMockProvider('fs-db-1');
    const provider2 = createMockProvider('fs-db-2');
    
    manager.registerProvider(provider1);
    manager.registerProvider(provider2);
    
    await manager.initializeAll();
    
    expect(provider1.initialize).toHaveBeenCalled();
    expect(provider1.start).toHaveBeenCalled();
    expect(provider2.initialize).toHaveBeenCalled();
    expect(provider2.start).toHaveBeenCalled();
  });
});
