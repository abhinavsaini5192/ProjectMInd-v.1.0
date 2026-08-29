import { describe, it, expect, beforeEach } from 'vitest';
import { StorageProviderRegistry } from '../../src/storage/core/StorageProviderRegistry';
import { IStorageProvider } from '../../src/storage/interfaces/IStorageProvider';
import { StorageProviderType, ProviderState } from '../../src/storage/types/StorageTypes';
import { ProviderRegistrationError } from '../../src/storage/types/StorageErrors';

describe('StorageProviderRegistry', () => {
  let registry: StorageProviderRegistry;

  const createMockProvider = (name: string, type: StorageProviderType): IStorageProvider => ({
    name,
    type,
    state: ProviderState.Unregistered,
    initialize: async () => {},
    start: async () => {},
    stop: async () => {},
    dispose: async () => {},
    healthCheck: async () => ({ providerName: name, isHealthy: true, lastCheckTimestamp: '' }),
    getStatistics: async () => ({ providerName: name, totalReads: 0, totalWrites: 0, averageLatencyMs: 0, uptimeMs: 0, activeConnections: 0, errorCount: 0 }),
    backup: async () => {},
    restore: async () => {},
    migrate: async () => {}
  });

  beforeEach(() => {
    registry = new StorageProviderRegistry();
  });

  it('should register a new provider', () => {
    const provider = createMockProvider('test-sqlite', StorageProviderType.Registry);
    registry.register(provider);
    
    expect(registry.getByName('test-sqlite')).toBe(provider);
    expect(registry.getByType(StorageProviderType.Registry)).toBe(provider);
  });

  it('should throw an error on duplicate registration', () => {
    const provider1 = createMockProvider('test-sqlite', StorageProviderType.Registry);
    const provider2 = createMockProvider('test-sqlite', StorageProviderType.Registry);
    
    registry.register(provider1);
    expect(() => registry.register(provider2)).toThrowError(ProviderRegistrationError);
  });

  it('should list all providers', () => {
    registry.register(createMockProvider('sqlite', StorageProviderType.Registry));
    registry.register(createMockProvider('kuzu', StorageProviderType.Knowledge));
    
    expect(registry.getAll()).toHaveLength(2);
  });
});
