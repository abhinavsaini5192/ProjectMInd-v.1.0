# SQLite Runtime Architecture

The SQLite Runtime is the concrete structured persistence engine for ProjectMind v2.0. It strictly implements the `IStorageProvider` interfaces defined in the Storage Core (Phase W2.1) and isolates all relational database logic.

## Core Components
- **SQLiteProvider**: The abstract base class that implements `IStorageProvider`.
- **SQLiteConnectionManager**: Wraps `better-sqlite3`, enforcing `WAL` mode and synchronous options.
- **SQLiteTransactionManager**: Handles nested synchronous transactions for atomic operations.
- **SQLiteMigrationManager**: Manages the `_migrations` table and applies versioned SQL scripts.
- **SQLiteSchemaManager**: Handles base schema initialization.
- **SQLiteQueryBuilder**: Abstracts raw SQL strings behind a type-safe API.
- **SQLiteHealthMonitor & SQLiteStatistics**: Provides telemetry and integrity checks.

## Single Responsibility Databases
Instead of one massive database, ProjectMind splits structured storage into 5 files:
1. `registry.db`: Metadata and state across all repositories.
2. `memory.db`: Individual AI memories and context blocks.
3. `metadata.db`: File parsing metadata and symbol tables.
4. `cache.db`: Ephemeral cache (ASTs, parse results).
5. `settings.db`: Configuration and overrides.
