# Pointer File Specification (`.projectmind.json`)

The pointer file is the ONLY ProjectMind artifact stored in the user's source repository. It contains no runtime state and is purely used to link the local repository folder to the Global Workspace in AppData.

## Schema Version: 2.0.0

```json
{
  "repositoryId": "uuid-string-identifying-the-repo",
  "workspaceVersion": "2.0.0",
  "createdAt": "2026-08-05T12:00:00.000Z",
  "workspaceType": "global"
}
```

- **repositoryId**: Maps exactly to the folder name in `ProjectMind/workspaces/`.
- **workspaceVersion**: Used to trigger migration scripts if the schema changes.
- **workspaceType**: Always `global` in the v2.0 architecture.
