import { ValidationIssue } from './ValidationIssue';

export interface ValidationReport {
  repositoryId: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  score: number;
  checks: Record<string, 'PASS' | 'FAIL' | 'WARN'>;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  timestamp: string;
}
