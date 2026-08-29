import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageLifecycleManager } from '../../src/storage/core/StorageLifecycleManager';
import { IStorageProvider } from '../../src/storage/interfaces/IStorageProvider';
import { StorageProviderType, ProviderState } from '../../src/storage/types/StorageTypes';
import { NodeEventBus } from '../../src/workspace/events/NodeEventBus';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import { StorageEvents } from '../../src/storage/types/StorageEvents';

describe('StorageLifecycleManager', () => {
  let lifecycle: StorageLifecycleManager;
  let eventBus: NodeEventBus;

  const createMockProvider = (): IStorageProvider => ({
    name: 'test-db',
    type: StorageProviderType.Memory,
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
    eventBus = new NodeEventBus();
    const logger = new StructuredLogger();
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    lifecycle = new StorageLifecycleManager(eventBus, logger);
  });

  it('should initialize and emit events', async () => {
    const provider = createMockProvider();
    const spy = vi.spyOn(eventBus, 'publish');
    
    await lifecycle.initialize(provider);
    
    expect(provider.initialize).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(StorageEvents.StorageInitializing, { providerName: 'test-db' });
    expect(spy).toHaveBeenCalledWith(StorageEvents.StorageInitialized, { providerName: 'test-db' });
  });

  it('should start and emit events', async () => {
    const provider = createMockProvider();
    const spy = vi.spyOn(eventBus, 'publish');
    
    await lifecycle.start(provider);
    
    expect(provider.start).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(StorageEvents.StorageStarted, { providerName: 'test-db' });
  });
});
