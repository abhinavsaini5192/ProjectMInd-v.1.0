# Storage API Reference

The Storage API defines the strict contracts (Interfaces) that every database provider must implement to be compatible with ProjectMind.

## `IStorageProvider`

The base interface for all providers.

```typescript
export interface IStorageProvider {
  readonly name: string;
  readonly type: StorageProviderType;
  readonly state: ProviderState;

  initialize(config: StorageConfiguration): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  dispose(): Promise<void>;

  healthCheck(): Promise<StorageHealth>;
  getStatistics(): Promise<StorageStatistics>;
  
  backup(destinationPath: string): Promise<void>;
  restore(sourcePath: string): Promise<void>;
  migrate(targetVersion: string): Promise<void>;
}
```

## `IStorageFactory`

Used to dynamically resolve registered providers.

```typescript
export interface IStorageFactory {
  getProviderByName(name: string, context?: StorageContext): IStorageProvider;
  getProviderByType(type: StorageProviderType, context?: StorageContext): IStorageProvider;
}
```
