export interface RepositoryRecord {
  id: string;
  path: string;
  createdAt: string;
  status: string;
}

export interface IRegistryStore {
  connect(path: string): Promise<void>;
  insertRepository(repo: RepositoryRecord): Promise<void>;
  getRepositoryByPath(path: string): Promise<RepositoryRecord | null>;
  getRepositoryById(id: string): Promise<RepositoryRecord | null>;
  listAll(): Promise<RepositoryRecord[]>;
  close(): Promise<void>;
}

export const IRegistryStoreToken = Symbol('IRegistryStore');
