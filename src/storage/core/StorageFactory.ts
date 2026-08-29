import { IStorageFactory } from '../interfaces/IStorageFactory';
import { IStorageProvider } from '../interfaces/IStorageProvider';
import { StorageProviderType } from '../types/StorageTypes';
import { StorageContext } from '../models/StorageContext';
import { StorageProviderRegistry } from './StorageProviderRegistry';
import { ProviderResolutionError } from '../types/StorageErrors';
import { ILogger } from '../../workspace/interfaces/ILogger';

export class StorageFactory implements IStorageFactory {
  constructor(
    private registry: StorageProviderRegistry,
    private logger: ILogger
  ) {}

  getProviderByName(name: string, context?: StorageContext): IStorageProvider {
    const provider = this.registry.getByName(name);
    if (!provider) {
      this.logger.error({
        component: 'StorageFactory',
        operation: 'getProviderByName',
        message: `Provider '${name}' not found.`,
        severity: 'ERROR',
        details: { context }
      });
      throw new ProviderResolutionError(`Storage provider '${name}' is not registered.`);
    }
    return provider;
  }

  getProviderByType(type: StorageProviderType, context?: StorageContext): IStorageProvider {
    const provider = this.registry.getByType(type);
    if (!provider) {
      this.logger.error({
        component: 'StorageFactory',
        operation: 'getProviderByType',
        message: `No default provider found for type '${type}'.`,
        severity: 'ERROR',
        details: { context }
      });
      throw new ProviderResolutionError(`No storage provider registered for type '${type}'.`);
    }
    return provider;
  }
}

export const IStorageFactoryToken = Symbol('StorageFactory');
