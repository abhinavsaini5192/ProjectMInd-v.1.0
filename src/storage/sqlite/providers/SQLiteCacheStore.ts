import { SQLiteProvider } from '../core/SQLiteProvider';
import { StorageProviderType } from '../../types/StorageTypes';
import { ILogger } from '../../../workspace/interfaces/ILogger';
import * as fs from 'fs';

export class SQLiteCacheStore extends SQLiteProvider {
  constructor(dbPath: string, logger: ILogger) {
    super('sqlite-cache', StorageProviderType.Cache, dbPath, logger);
  }

  protected getInitialSchema(): string {
    return fs.readFileSync(__dirname + '/../schemas/CacheSchema.sql', 'utf8');
  }
}
