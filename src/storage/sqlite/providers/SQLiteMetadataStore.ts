import { SQLiteProvider } from '../core/SQLiteProvider';
import { StorageProviderType } from '../../types/StorageTypes';
import { ILogger } from '../../../workspace/interfaces/ILogger';
import * as fs from 'fs';

export class SQLiteMetadataStore extends SQLiteProvider {
  constructor(dbPath: string, logger: ILogger) {
    super('sqlite-metadata', StorageProviderType.Knowledge, dbPath, logger); // Using Knowledge for metadata context right now
  }

  protected getInitialSchema(): string {
    return fs.readFileSync(__dirname + '/../schemas/MetadataSchema.sql', 'utf8');
  }
}
