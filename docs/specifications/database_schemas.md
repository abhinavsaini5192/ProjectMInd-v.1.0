# Database Schemas Specification

ProjectMind v2.0 splits relational data across 5 dedicated SQLite databases.

### Registry Database (`registry.db`)
- `repositories`: (id, name, path, status, created_at, updated_at)
- `workspace_metadata`: (key, value)

### Memory Database (`memory.db`)
- `memories`: (id, repository_id, content, type, version, created_at)
- `memory_history`: (history_id, memory_id, old_content, new_content, changed_at)

### Metadata Database (`metadata.db`)
- `file_metadata`: (file_path, language, size_bytes, checksum, last_analyzed_at)
- `symbols`: (symbol_id, file_path, name, type, line_number)

### Cache Database (`cache.db`)
- `cache_entries`: (key, data, expires_at, created_at)

### Settings Database (`settings.db`)
- `settings`: (setting_key, setting_value, scope, updated_at)
