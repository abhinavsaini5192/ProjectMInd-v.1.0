export interface WorkspacePermissions {
  canRead: boolean;
  canWrite: boolean;
  canExecute: boolean;
  isOwner: boolean;
  hasSufficientSpace: boolean;
}
