# Permissions

ProjectMind uses an explicit, granular permission model (`AgentPermission`). 

## Available Permissions
- `READ_REPOSITORY`
- `WRITE_REPOSITORY`
- `CREATE_FILES`
- `DELETE_FILES`
- `RUN_TESTS`
- `RUN_BUILD`
- `RUN_LINT`
- `RUN_TYPECHECK`
- `GIT_READ`
- `GIT_WRITE`
- `NETWORK_ACCESS`
- `PLUGIN_EXECUTION`

There is no `FULL_SYSTEM_ACCESS` or `UNSAFE_EXECUTION`. The Agent Executor will be explicitly denied from taking any action if the required granular permission is missing from its `PermissionSet`.
