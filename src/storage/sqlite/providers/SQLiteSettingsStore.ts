import { SQLiteProvider } from '../core/SQLiteProvider';
import { StorageProviderType } from '../../types/StorageTypes';
import { ILogger } from '../../../workspace/interfaces/ILogger';
import * as fs from 'fs';

export class SQLiteSettingsStore extends SQLiteProvider {
  constructor(dbPath: string, logger: ILogger) {
    // We map Settings to a type, e.g., Registry or a generic if we add it. 
    // We'll reuse Registry for now, but name it uniquely.
    super('sqlite-settings', StorageProviderType.Registry, dbPath, logger);
  }

  protected getInitialSchema(): string {
    return fs.readFileSync(__dirname + '/../schemas/SettingsSchema.sql', 'utf8');
  }
}
