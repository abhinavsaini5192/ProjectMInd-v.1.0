import { IWorkspaceDirectoryManager } from './IWorkspaceDirectoryManager';
import { IWorkspaceFileManager } from './IWorkspaceFileManager';
import { IWorkspacePointerManager } from './IWorkspacePointerManager';
import { IWorkspacePermissions } from './IWorkspacePermissions';
import { IWorkspaceTemplateManager } from './IWorkspaceTemplateManager';

export interface IWorkspaceFilesystem {
  directories: IWorkspaceDirectoryManager;
  files: IWorkspaceFileManager;
  pointers: IWorkspacePointerManager;
  permissions: IWorkspacePermissions;
  templates: IWorkspaceTemplateManager;
  
  getGlobalWorkspacePath(): string;
  getRepositoryWorkspacePath(repositoryId: string): string;
}

export const IWorkspaceFilesystemToken = Symbol('IWorkspaceFilesystem');
