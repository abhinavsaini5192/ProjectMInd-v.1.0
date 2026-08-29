CREATE TABLE IF NOT EXISTS file_metadata (
  file_path TEXT PRIMARY KEY,
  language TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  last_analyzed_at DATETIME
);

CREATE TABLE IF NOT EXISTS symbols (
  symbol_id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  line_number INTEGER,
  FOREIGN KEY(file_path) REFERENCES file_metadata(file_path)
);
