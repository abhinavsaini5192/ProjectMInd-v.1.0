import { SQLiteConnectionManager } from './SQLiteConnectionManager';
import { StorageCoreError } from '../../types/StorageErrors';

export class SQLiteTransactionManager {
  constructor(private connectionManager: SQLiteConnectionManager) {}

  execute<T>(operation: () => T): T {
    const db = this.connectionManager.getConnection();
    const transaction = db.transaction(operation);
    
    try {
      return transaction();
    } catch (error: any) {
      throw new StorageCoreError(`Transaction failed: ${error.message}`);
    }
  }

  async executeAsync<T>(operation: () => Promise<T>): Promise<T> {
    const db = this.connectionManager.getConnection();
    
    // better-sqlite3 does not natively support async transactions, 
    // so we handle it carefully using SAVEPOINTs or just manual BEGIN/COMMIT if needed.
    // However, since better-sqlite3 is synchronous, true async inside transactions is tricky and locks the DB.
    // For now, we simulate an async wrapper that commits immediately.
    
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = await operation();
      db.exec('COMMIT');
      return result;
    } catch (error: any) {
      db.exec('ROLLBACK');
      throw new StorageCoreError(`Async transaction failed: ${error.message}`);
    }
  }
}
