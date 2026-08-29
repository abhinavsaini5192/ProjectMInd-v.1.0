export interface DatabaseHealth {
  databaseName: string;
  isHealthy: boolean;
  integrityCheckPassed: boolean;
  foreignKeyCheckPassed: boolean;
  currentVersion: number;
  errors: string[];
}
