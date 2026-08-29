import { SQLiteConnectionManager } from './SQLiteConnectionManager';
import * as path from 'path';
import * as fs from 'fs/promises';

export class SQLiteBackupManager {
  constructor(private connectionManager: SQLiteConnectionManager, private dbPath: string) {}

  async backup(destinationDir: string): Promise<void> {
    const db = this.connectionManager.getConnection();
    const dbName = path.basename(this.dbPath);
    const destPath = path.join(destinationDir, `${dbName}.backup`);
    
    await db.backup(destPath);
  }
}
