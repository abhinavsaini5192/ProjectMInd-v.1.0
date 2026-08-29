import { SQLiteProvider } from '../core/SQLiteProvider';
import { StorageProviderType } from '../../types/StorageTypes';
import { ILogger } from '../../../workspace/interfaces/ILogger';
import * as fs from 'fs';

export class SQLiteMemoryStore extends SQLiteProvider {
  constructor(dbPath: string, logger: ILogger) {
    super('sqlite-memory', StorageProviderType.Memory, dbPath, logger);
  }

  protected getInitialSchema(): string {
    return fs.readFileSync(__dirname + '/../schemas/MemorySchema.sql', 'utf8');
  }
}
