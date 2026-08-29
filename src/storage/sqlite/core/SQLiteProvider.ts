import { IStorageProvider } from '../../interfaces/IStorageProvider';
import { StorageProviderType, ProviderState } from '../../types/StorageTypes';
import { StorageConfiguration } from '../../models/StorageConfiguration';
import { StorageHealth } from '../../models/StorageHealth';
import { StorageStatistics } from '../../models/StorageStatistics';
import { ILogger } from '../../../workspace/interfaces/ILogger';

import { SQLiteConnectionManager } from './SQLiteConnectionManager';
import { SQLiteHealthMonitor } from './SQLiteHealthMonitor';
import { SQLiteStatistics } from './SQLiteStatistics';
import { SQLiteBackupManager } from './SQLiteBackupManager';
import { SQLiteSchemaManager } from './SQLiteSchemaManager';
import { SQLiteMigrationManager } from './SQLiteMigrationManager';
import { SQLiteTransactionManager } from './SQLiteTransactionManager';
import { SQLiteQueryBuilder } from './SQLiteQueryBuilder';

export abstract class SQLiteProvider implements IStorageProvider {
  public state: ProviderState = ProviderState.Unregistered;
  
  protected connectionManager!: SQLiteConnectionManager;
  protected healthMonitor!: SQLiteHealthMonitor;
  protected statistics!: SQLiteStatistics;
  protected backupManager!: SQLiteBackupManager;
  protected schemaManager!: SQLiteSchemaManager;
  protected migrationManager!: SQLiteMigrationManager;
  protected transactionManager!: SQLiteTransactionManager;
  protected queryBuilder!: SQLiteQueryBuilder;

  constructor(
    public readonly name: string,
    public readonly type: StorageProviderType,
    protected dbPath: string,
    protected logger: ILogger
  ) {}

  protected abstract getInitialSchema(): string;

  async initialize(config: StorageConfiguration): Promise<void> {
    this.state = ProviderState.Initializing;
    
    this.connectionManager = new SQLiteConnectionManager(this.dbPath, this.logger, config.options);
    this.healthMonitor = new SQLiteHealthMonitor(this.connectionManager, this.name);
    this.statistics = new SQLiteStatistics(this.connectionManager, this.dbPath, this.name);
    this.backupManager = new SQLiteBackupManager(this.connectionManager, this.dbPath);
    this.migrationManager = new SQLiteMigrationManager(this.connectionManager, this.logger);
    this.schemaManager = new SQLiteSchemaManager(this.connectionManager, this.migrationManager);
    this.transactionManager = new SQLiteTransactionManager(this.connectionManager);
    this.queryBuilder = new SQLiteQueryBuilder(this.connectionManager);

    this.connectionManager.open();
    await this.schemaManager.initializeSchema(this.getInitialSchema());
    
    this.state = ProviderState.Ready;
  }

  async start(): Promise<void> {
    if (this.state !== ProviderState.Ready) {
      throw new Error(`Cannot start provider ${this.name} from state ${this.state}`);
    }
  }

  async stop(): Promise<void> {
    this.connectionManager.close();
    this.state = ProviderState.Stopped;
  }

  async dispose(): Promise<void> {
    await this.stop();
  }

  async healthCheck(): Promise<StorageHealth> {
    return this.healthMonitor.checkHealth();
  }

  async getStatistics(): Promise<StorageStatistics> {
    return this.statistics.getStatistics();
  }

  async backup(destinationPath: string): Promise<void> {
    await this.backupManager.backup(destinationPath);
  }

  async restore(sourcePath: string): Promise<void> {
    throw new Error('SQLite restore must be done via filesys overwrite while stopped.');
  }

  async migrate(targetVersion: string): Promise<void> {
    // Advanced migration logic handled by migration manager
  }
}
