export interface StorageHealth {
  providerName: string;
  isHealthy: boolean;
  message?: string;
  lastCheckTimestamp: string;
  latencyMs?: number;
  errors?: string[];
}
