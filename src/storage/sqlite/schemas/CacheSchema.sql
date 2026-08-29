CREATE TABLE IF NOT EXISTS cache_entries (
  key TEXT PRIMARY KEY,
  data BLOB NOT NULL,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at);
