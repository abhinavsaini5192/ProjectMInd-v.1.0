import { DIContainer } from '../../../workspace/di/DIContainer';
import { ILoggerToken, ILogger } from '../../../workspace/interfaces/ILogger';

import { SQLiteRegistryStore } from './providers/SQLiteRegistryStore';
import { SQLiteMemoryStore } from './providers/SQLiteMemoryStore';
import { SQLiteMetadataStore } from './providers/SQLiteMetadataStore';
import { SQLiteCacheStore } from './providers/SQLiteCacheStore';
import { SQLiteSettingsStore } from './providers/SQLiteSettingsStore';

export class SQLiteBootstrap {
  static configure(container: DIContainer, databaseDirectory: string): void {
    
    // We register factories or singletons that instantiate the providers with their specific DB paths.
    // In actual implementation, we would register these into the StorageProviderRegistry.
    // For DI container, we'll register them with unique string tokens.

    container.registerFactory('SQLiteRegistryStore', (c) => {
      return new SQLiteRegistryStore(`${databaseDirectory}/registry.db`, c.resolve<ILogger>(ILoggerToken));
    });

    container.registerFactory('SQLiteMemoryStore', (c) => {
      return new SQLiteMemoryStore(`${databaseDirectory}/memory.db`, c.resolve<ILogger>(ILoggerToken));
    });

    container.registerFactory('SQLiteMetadataStore', (c) => {
      return new SQLiteMetadataStore(`${databaseDirectory}/metadata.db`, c.resolve<ILogger>(ILoggerToken));
    });

    container.registerFactory('SQLiteCacheStore', (c) => {
      return new SQLiteCacheStore(`${databaseDirectory}/cache.db`, c.resolve<ILogger>(ILoggerToken));
    });

    container.registerFactory('SQLiteSettingsStore', (c) => {
      return new SQLiteSettingsStore(`${databaseDirectory}/settings.db`, c.resolve<ILogger>(ILoggerToken));
    });
  }
}
