import os from 'os';
import path from 'path';

export class WorkspacePathResolver {
  resolveGlobalWorkspacePath(): string {
    const platform = os.platform();
    
    if (process.env.PROJECTMIND_WORKSPACE_DIR) {
      return process.env.PROJECTMIND_WORKSPACE_DIR;
    }

    if (platform === 'win32') {
      const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
      return path.join(localAppData, 'ProjectMind');
    }

    if (platform === 'darwin') {
      return path.join(os.homedir(), 'Library', 'Application Support', 'ProjectMind');
    }

    // linux or other
    const xdgDataHome = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
    return path.join(xdgDataHome, 'projectmind');
  }

  resolveWorkspacePath(uuid: string): string {
    const root = this.resolveGlobalWorkspacePath();
    return path.join(root, 'workspaces', uuid);
  }
}

export const IWorkspacePathResolverToken = Symbol('WorkspacePathResolver');
