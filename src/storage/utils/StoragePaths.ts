import path from 'path';

export class StoragePaths {
  static getProviderPath(workspaceRoot: string, providerName: string): string {
    return path.join(workspaceRoot, 'databases', providerName);
  }

  static getBackupPath(workspaceRoot: string, providerName: string): string {
    return path.join(workspaceRoot, 'backups', providerName);
  }
}
