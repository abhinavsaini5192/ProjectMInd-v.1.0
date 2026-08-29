export interface StorageStatistics {
  providerName: string;
  totalReads: number;
  totalWrites: number;
  averageLatencyMs: number;
  uptimeMs: number;
  activeConnections: number;
  errorCount: number;
  lastErrorTimestamp?: string;
  bytesStored?: number;
}
