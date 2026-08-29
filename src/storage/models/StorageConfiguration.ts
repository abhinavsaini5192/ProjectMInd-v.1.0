export interface StorageConfiguration {
  connectionString: string;
  maxConnections: number;
  timeoutMs: number;
  enableCache: boolean;
  readOnly: boolean;
  options?: Record<string, any>;
}
