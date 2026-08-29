import { SQLiteConnectionManager } from './SQLiteConnectionManager';

export class SQLiteQueryBuilder {
  constructor(private connectionManager: SQLiteConnectionManager) {}

  select(table: string, columns: string[] = ['*'], where?: string, params: any[] = []): any[] {
    const db = this.connectionManager.getConnection();
    const cols = columns.join(', ');
    let query = `SELECT ${cols} FROM ${table}`;
    if (where) {
      query += ` WHERE ${where}`;
    }
    return db.prepare(query).all(...params);
  }

  insert(table: string, data: Record<string, any>): void {
    const db = this.connectionManager.getConnection();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    db.prepare(query).run(...values);
  }

  update(table: string, data: Record<string, any>, where: string, params: any[] = []): void {
    const db = this.connectionManager.getConnection();
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const setters = keys.map(k => `${k} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${setters} WHERE ${where}`;
    
    db.prepare(query).run(...values, ...params);
  }

  delete(table: string, where: string, params: any[] = []): void {
    const db = this.connectionManager.getConnection();
    db.prepare(`DELETE FROM ${table} WHERE ${where}`).run(...params);
  }
}
