import { StorageProviderType } from '../types/StorageTypes';
import { IStorageProvider } from './IStorageProvider';
import { StorageContext } from '../models/StorageContext';

export interface IStorageFactory {
  /**
   * Resolves a registered provider by its explicit name.
   */
  getProviderByName(name: string, context?: StorageContext): IStorageProvider;

  /**
   * Resolves the primary/default provider registered for a given type.
   */
  getProviderByType(type: StorageProviderType, context?: StorageContext): IStorageProvider;
}

export const IStorageFactoryToken = Symbol('IStorageFactory');
