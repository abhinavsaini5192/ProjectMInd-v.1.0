import { SQLiteConnectionManager } from './SQLiteConnectionManager';
import { SQLiteMigrationManager } from './SQLiteMigrationManager';

export class SQLiteSchemaManager {
  constructor(
    private connectionManager: SQLiteConnectionManager,
    private migrationManager: SQLiteMigrationManager
  ) {}

  async initializeSchema(initialSchemaSql: string): Promise<void> {
    const currentVersion = this.migrationManager.getCurrentVersion();
    
    if (currentVersion === 0) {
      // First boot, execute base schema
      const db = this.connectionManager.getConnection();
      db.exec(initialSchemaSql);
      this.migrationManager.applyMigration(1, 'initial_schema', '-- Base Schema Applied', 'initial_hash');
    }
  }
}
