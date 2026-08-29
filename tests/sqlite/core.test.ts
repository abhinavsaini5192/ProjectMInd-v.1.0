import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteConnectionManager } from '../../src/storage/sqlite/core/SQLiteConnectionManager';
import { SQLiteTransactionManager } from '../../src/storage/sqlite/core/SQLiteTransactionManager';
import { SQLiteMigrationManager } from '../../src/storage/sqlite/core/SQLiteMigrationManager';
import { SQLiteQueryBuilder } from '../../src/storage/sqlite/core/SQLiteQueryBuilder';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';

describe('SQLite Core Managers', () => {
  let conn: SQLiteConnectionManager;
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger();
    // Suppress logs during testing
    logger.info = () => {};
    logger.error = () => {};

    // Use an in-memory database for testing
    conn = new SQLiteConnectionManager(':memory:', logger);
    conn.open();
  });

  afterEach(() => {
    conn.close();
  });

  it('should open and close connection correctly', () => {
    const db = conn.getConnection();
    expect(db.open).toBe(true);
    conn.close();
    expect(db.open).toBe(false);
  });

  it('should execute basic queries via QueryBuilder', () => {
    const builder = new SQLiteQueryBuilder(conn);
    const db = conn.getConnection();
    
    db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    builder.insert('test', { id: 1, name: 'alpha' });
    
    const results = builder.select('test', ['*'], 'id = ?', [1]);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('alpha');
    
    builder.update('test', { name: 'beta' }, 'id = ?', [1]);
    const updated = builder.select('test');
    expect(updated[0].name).toBe('beta');

    builder.delete('test', 'id = ?', [1]);
    expect(builder.select('test').length).toBe(0);
  });

  it('should handle transactions correctly', () => {
    const txn = new SQLiteTransactionManager(conn);
    const db = conn.getConnection();
    
    db.exec('CREATE TABLE tx_test (id INTEGER PRIMARY KEY, val TEXT)');
    
    txn.execute(() => {
      db.prepare('INSERT INTO tx_test (id, val) VALUES (?, ?)').run(1, 'commit');
    });

    const val1 = db.prepare('SELECT val FROM tx_test WHERE id = 1').get() as any;
    expect(val1.val).toBe('commit');

    expect(() => {
      txn.execute(() => {
        db.prepare('INSERT INTO tx_test (id, val) VALUES (?, ?)').run(2, 'fail');
        throw new Error('Rollback Trigger');
      });
    }).toThrow('Transaction failed: Rollback Trigger');

    const val2 = db.prepare('SELECT val FROM tx_test WHERE id = 2').get();
    expect(val2).toBeUndefined();
  });

  it('should handle migrations', () => {
    const mig = new SQLiteMigrationManager(conn, logger);
    expect(mig.getCurrentVersion()).toBe(0);

    mig.applyMigration(1, 'init', 'CREATE TABLE mig_test (id INTEGER);', 'hash1');
    expect(mig.getCurrentVersion()).toBe(1);
    
    const count = conn.getConnection().prepare('SELECT count(*) as c FROM _migrations').get() as any;
    expect(count.c).toBe(1);
  });
});
