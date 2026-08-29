import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageFactory } from '../../src/storage/core/StorageFactory';
import { StorageProviderRegistry } from '../../src/storage/core/StorageProviderRegistry';
import { IStorageProvider } from '../../src/storage/interfaces/IStorageProvider';
import { StorageProviderType, ProviderState } from '../../src/storage/types/StorageTypes';
import { ProviderResolutionError } from '../../src/storage/types/StorageErrors';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';

describe('StorageFactory', () => {
  let factory: StorageFactory;
  let registry: StorageProviderRegistry;

  const createMockProvider = (name: string, type: StorageProviderType): IStorageProvider => ({
    name, type, state: ProviderState.Unregistered,
    initialize: async () => {}, start: async () => {}, stop: async () => {}, dispose: async () => {},
    healthCheck: async () => ({ providerName: name, isHealthy: true, lastCheckTimestamp: '' }),
    getStatistics: async () => ({ providerName: name, totalReads: 0, totalWrites: 0, averageLatencyMs: 0, uptimeMs: 0, activeConnections: 0, errorCount: 0 }),
    backup: async () => {}, restore: async () => {}, migrate: async () => {}
  });

  beforeEach(() => {
    registry = new StorageProviderRegistry();
    const logger = new StructuredLogger();
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    factory = new StorageFactory(registry, logger);
  });

  it('should resolve provider by name', () => {
    const provider = createMockProvider('sqlite-1', StorageProviderType.Registry);
    registry.register(provider);
    
    expect(factory.getProviderByName('sqlite-1')).toBe(provider);
  });

  it('should resolve provider by type', () => {
    const provider = createMockProvider('sqlite-1', StorageProviderType.Registry);
    registry.register(provider);
    
    expect(factory.getProviderByType(StorageProviderType.Registry)).toBe(provider);
  });

  it('should throw error when resolving unknown name', () => {
    expect(() => factory.getProviderByName('unknown')).toThrowError(ProviderResolutionError);
  });

  it('should throw error when resolving unknown type', () => {
    expect(() => factory.getProviderByType(StorageProviderType.Vector)).toThrowError(ProviderResolutionError);
  });
});
