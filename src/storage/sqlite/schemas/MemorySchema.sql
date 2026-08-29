CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memory_history (
  history_id TEXT PRIMARY KEY,
  memory_id TEXT NOT NULL,
  old_content TEXT NOT NULL,
  new_content TEXT NOT NULL,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(memory_id) REFERENCES memories(id)
);
