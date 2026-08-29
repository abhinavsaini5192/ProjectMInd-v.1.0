import { DIContainer } from '../../workspace/di/DIContainer';
import { IEventBusToken } from '../../workspace/interfaces/IEventBus';
import { ILoggerToken } from '../../workspace/interfaces/ILogger';

import { StorageProviderRegistry, IStorageProviderRegistryToken } from './StorageProviderRegistry';
import { StorageFactory, IStorageFactoryToken } from './StorageFactory';
import { StorageValidator, IStorageValidatorToken } from './StorageValidator';
import { StorageLifecycleManager, IStorageLifecycleManagerToken } from './StorageLifecycleManager';
import { StorageManager } from './StorageManager';
import { IStorageManagerToken } from '../interfaces/IStorageManager';

export class StorageBootstrap {
  static configure(container: DIContainer): void {
    container.registerSingleton(IStorageProviderRegistryToken, StorageProviderRegistry);
    
    container.registerSingleton(IStorageFactoryToken, StorageFactory, [
      IStorageProviderRegistryToken,
      ILoggerToken
    ]);

    container.registerSingleton(IStorageValidatorToken, StorageValidator);

    container.registerSingleton(IStorageLifecycleManagerToken, StorageLifecycleManager, [
      IEventBusToken,
      ILoggerToken
    ]);

    container.registerSingleton(IStorageManagerToken, StorageManager, [
      IStorageProviderRegistryToken,
      IStorageFactoryToken,
      IStorageLifecycleManagerToken,
      IStorageValidatorToken,
      IEventBusToken,
      ILoggerToken
    ]);
  }
}
