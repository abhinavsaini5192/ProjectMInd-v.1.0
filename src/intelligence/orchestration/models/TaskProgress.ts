export interface TaskProgress {
  goalsCompleted: string[];
  goalsRemaining: string[];
  stepsCompleted: number;
  stepsRemaining: number;
  filesChanged: string[];
  testsPassed: number;
  testsFailed: number;
  blockers: string[];
  unresolvedIssues: string[];
  confidence: number;
}
