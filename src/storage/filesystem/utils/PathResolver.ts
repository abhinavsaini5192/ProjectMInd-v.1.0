import * as os from 'os';
import * as path from 'path';

export class PathResolver {
  static getOSAppDataPath(): string {
    if (process.platform === 'win32') {
      return process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    }
    if (process.platform === 'darwin') {
      return path.join(os.homedir(), 'Library', 'Application Support');
    }
    return process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  }

  static getGlobalWorkspaceRoot(): string {
    return path.join(this.getOSAppDataPath(), 'ProjectMind');
  }

  static getRepositoryWorkspacePath(repositoryId: string): string {
    return path.join(this.getGlobalWorkspaceRoot(), 'workspaces', repositoryId);
  }

  static getPointerFilePath(repositoryRoot: string): string {
    return path.join(repositoryRoot, '.projectmind.json');
  }
}
