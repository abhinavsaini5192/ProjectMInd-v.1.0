# SQLite Query Guide

**WARNING**: Raw SQL strings must NEVER bleed out of the `src/storage/sqlite/` subsystem.

All SQL querying should be performed using the `SQLiteQueryBuilder`.

## Examples

### Select
```typescript
const builder = new SQLiteQueryBuilder(connManager);
const rows = builder.select('repositories', ['id', 'name'], 'status = ?', ['active']);
```

### Insert
```typescript
builder.insert('repositories', {
  id: 'uuid-1',
  name: 'my-repo',
  path: '/fake/path',
  status: 'active'
});
```

### Transactions
If multiple builder calls need to be atomic, wrap them in the `SQLiteTransactionManager`:
```typescript
const txn = new SQLiteTransactionManager(connManager);
txn.execute(() => {
  builder.insert('memories', { ... });
  builder.update('repositories', { ... }, 'id = ?', ['uuid-1']);
});
```
