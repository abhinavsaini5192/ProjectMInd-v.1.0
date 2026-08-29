export interface HealthReport {
  status: 'healthy' | 'degraded' | 'corrupted';
  checks: Record<string, boolean>;
  errors: Array<{
    code: string;
    message: string;
    severity: 'warning' | 'critical';
  }>;
}

export interface IHealthCheck {
  name: string;
  execute(repositoryId?: string): Promise<boolean>;
  getErrors(): Array<{ code: string; message: string; severity: 'warning' | 'critical' }>;
}
