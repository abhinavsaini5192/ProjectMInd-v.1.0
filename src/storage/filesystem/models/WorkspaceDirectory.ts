export interface WorkspaceDirectory {
  path: string;
  exists: boolean;
  sizeBytes?: number;
  createdAt?: string;
  updatedAt?: string;
}
