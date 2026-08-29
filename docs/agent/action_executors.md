# Action Executors

Rather than relying on `exec(bash_string)`, ProjectMind implements strongly-typed executors.

## FileExecutor
Handles `CREATE_FILE`, `EDIT_FILE`, `DELETE_FILE`, `RENAME_FILE`, `READ_FILE`.
Every path passes through `PathGuard` first. File edits optionally support optimistic concurrency via `expectedHash` to prevent overwriting human-modified files.

## SearchExecutor
Handles structural queries like `GET_DEPENDENCIES` or `SEARCH_SYMBOL` by hooking directly into the Layer 2 Knowledge engines.

## VerificationExecutor
Handles `RUN_TEST`, `RUN_LINT`, `RUN_TYPECHECK` by abstracting them as controlled tooling processes, avoiding arbitrary shell access.

## GitExecutor
Handles local source control status (`GIT_STATUS`, `GIT_DIFF`). It does not automatically perform remote pushes.
