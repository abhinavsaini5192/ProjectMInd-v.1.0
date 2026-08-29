export interface ExecutionObservation {
  observationId: string;
  executionId: string;
  planId: string;
  repositoryId: string;
  workspaceId: string;
  timestamp: number;
  executionStatus: string;
  changedFiles: string[];
  createdFiles: string[];
  deletedFiles: string[];
  movedFiles: string[];
  executedCommands: string[];
  testResults: {
    passed: boolean;
    testsRun: number;
    testsPassed: number;
    testsFailed: number;
    failures: string[];
  };
  buildResults: {
    success: boolean;
    errors: string[];
  };
  architectureResults: {
    violationsDetected: string[];
    violationsResolved: string[];
  };
  verificationResults: {
    passed: boolean;
    checks: string[];
  };
  errors: string[];
  warnings: string[];
}
