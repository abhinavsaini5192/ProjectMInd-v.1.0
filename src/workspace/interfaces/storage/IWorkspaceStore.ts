export interface IWorkspaceStore {
  ensureDirectory(path: string): Promise<void>;
  writeJson<T>(path: string, data: T): Promise<void>;
  readJson<T>(path: string): Promise<T>;
  writeText(path: string, data: string): Promise<void>;
  readText(path: string): Promise<string>;
  pathExists(path: string): Promise<boolean>;
}

export const IWorkspaceStoreToken = Symbol('IWorkspaceStore');
