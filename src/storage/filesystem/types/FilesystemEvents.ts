export enum FilesystemEvents {
  WorkspaceCreated = 'workspace.filesystem.created',
  WorkspaceDeleted = 'workspace.filesystem.deleted',
  WorkspaceOpened = 'workspace.filesystem.opened',
  WorkspaceClosed = 'workspace.filesystem.closed',
  DirectoryCreated = 'workspace.filesystem.directory_created',
  DirectoryDeleted = 'workspace.filesystem.directory_deleted',
  PointerCreated = 'workspace.filesystem.pointer_created',
  PointerUpdated = 'workspace.filesystem.pointer_updated',
  WorkspaceLocked = 'workspace.filesystem.locked',
  WorkspaceUnlocked = 'workspace.filesystem.unlocked',
  FilesystemValidated = 'workspace.filesystem.validated',
  FilesystemRecovered = 'workspace.filesystem.recovered'
}
