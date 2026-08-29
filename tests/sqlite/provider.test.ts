import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SQLiteRegistryStore } from '../../src/storage/sqlite/providers/SQLiteRegistryStore';
import { StorageConfiguration } from '../../src/storage/models/StorageConfiguration';
import { ProviderState, StorageProviderType } from '../../src/storage/types/StorageTypes';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import * as fs from 'fs';
import * as path from 'path';

describe('SQLiteRegistryStore', () => {
  let store: SQLiteRegistryStore;
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger();
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    
    // We pass an in-memory DB path. Better-sqlite3 supports :memory:
    store = new SQLiteRegistryStore(':memory:', logger);
  });

  afterEach(async () => {
    if (store.state === ProviderState.Ready) {
      await store.dispose();
    }
  });

  it('should initialize and apply base schema', async () => {
    const config: StorageConfiguration = {
      workspaceId: 'test',
      storageRoot: '',
      encryptionEnabled: false
    };

    expect(store.state).toBe(ProviderState.Unregistered);
    await store.initialize(config);
    expect(store.state).toBe(ProviderState.Ready);

    const stats = await store.getStatistics();
    expect(stats.tableCount).toBeGreaterThanOrEqual(1);
  });

  it('should return health status', async () => {
    await store.initialize({ workspaceId: 'test', storageRoot: '', encryptionEnabled: false });
    const health = await store.healthCheck();
    
    expect(health.databaseName).toBe('sqlite-registry');
    expect(health.isHealthy).toBe(true);
    expect(health.integrityCheckPassed).toBe(true);
    expect(health.foreignKeyCheckPassed).toBe(true);
  });
});
