export interface IWorkspaceFileManager {
  readJson<T>(path: string): Promise<T>;
  writeJson<T>(path: string, data: T, atomic?: boolean): Promise<void>;
  readText(path: string): Promise<string>;
  writeText(path: string, data: string, atomic?: boolean): Promise<void>;
  copyFile(source: string, destination: string): Promise<void>;
  moveFile(source: string, destination: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
}

export const IWorkspaceFileManagerToken = Symbol('IWorkspaceFileManager');
