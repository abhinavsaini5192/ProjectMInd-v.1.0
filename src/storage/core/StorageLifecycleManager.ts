import { IStorageLifecycle } from '../interfaces/IStorageLifecycle';
import { IStorageProvider } from '../interfaces/IStorageProvider';
import { IEventBus } from '../../workspace/interfaces/IEventBus';
import { ILogger } from '../../workspace/interfaces/ILogger';
import { StorageEvents } from '../types/StorageEvents';
import { ProviderState } from '../types/StorageTypes';
import { StorageLifecycleError } from '../types/StorageErrors';

export class StorageLifecycleManager implements IStorageLifecycle {
  constructor(
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async initialize(provider: IStorageProvider): Promise<void> {
    if (provider.state !== ProviderState.Registered && provider.state !== ProviderState.Unregistered) {
      throw new StorageLifecycleError(`Cannot initialize provider '${provider.name}' from state '${provider.state}'.`);
    }

    this.logger.info({ component: 'StorageLifecycleManager', operation: 'initialize', message: `Initializing provider ${provider.name}`, severity: 'INFO' });
    this.eventBus.publish(StorageEvents.StorageInitializing, { providerName: provider.name });
    
    // In actual implementation, we would pass real config here. 
    // This is orchestrator logic.
    await provider.initialize({ connectionString: '', maxConnections: 10, timeoutMs: 5000, enableCache: false, readOnly: false });
    
    this.eventBus.publish(StorageEvents.StorageInitialized, { providerName: provider.name });
  }

  async start(provider: IStorageProvider): Promise<void> {
    this.logger.info({ component: 'StorageLifecycleManager', operation: 'start', message: `Starting provider ${provider.name}`, severity: 'INFO' });
    await provider.start();
    this.eventBus.publish(StorageEvents.StorageStarted, { providerName: provider.name });
  }

  async stop(provider: IStorageProvider): Promise<void> {
    this.logger.info({ component: 'StorageLifecycleManager', operation: 'stop', message: `Stopping provider ${provider.name}`, severity: 'INFO' });
    await provider.stop();
    this.eventBus.publish(StorageEvents.StorageStopped, { providerName: provider.name });
  }

  async dispose(provider: IStorageProvider): Promise<void> {
    this.logger.info({ component: 'StorageLifecycleManager', operation: 'dispose', message: `Disposing provider ${provider.name}`, severity: 'INFO' });
    await provider.dispose();
    this.eventBus.publish(StorageEvents.StorageDisposed, { providerName: provider.name });
  }
}

export const IStorageLifecycleManagerToken = Symbol('StorageLifecycleManager');
