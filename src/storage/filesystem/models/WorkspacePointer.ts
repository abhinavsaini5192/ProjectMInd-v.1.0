import { WorkspaceType } from '../types/FilesystemTypes';

export interface WorkspacePointer {
  repositoryId: string;
  workspaceVersion: string;
  createdAt: string;
  workspaceType: WorkspaceType;
}
