# Migration System Architecture

ProjectMind strictly versions schema updates via the `SQLiteMigrationManager`.

## `_migrations` Table
Every database created by the SQLite runtime automatically gets a `_migrations` table injected:
```sql
CREATE TABLE IF NOT EXISTS _migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  checksum TEXT NOT NULL,
  appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Migration Execution
When a Provider boots:
1. It queries `MAX(version)` from `_migrations`.
2. If `0` (or table doesn't exist), it executes the `getInitialSchema()` script and logs version `1`.
3. In future phases, it will scan `src/storage/sqlite/migrations/` for files greater than the current version.
4. Migrations are executed within an atomic transaction. If the transaction fails, the entire migration rolls back.
