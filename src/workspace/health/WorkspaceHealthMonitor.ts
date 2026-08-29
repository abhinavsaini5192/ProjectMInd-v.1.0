import { HealthReport, IHealthCheck } from './IHealthCheck';
import { ILogger } from '../interfaces/ILogger';

export class WorkspaceHealthMonitor {
  private checks: IHealthCheck[] = [];

  constructor(private logger: ILogger) {}

  registerCheck(check: IHealthCheck): void {
    this.checks.push(check);
  }

  async runDiagnostics(repositoryId?: string): Promise<HealthReport> {
    this.logger.info({ component: 'WorkspaceHealthMonitor', operation: 'runDiagnostics', message: 'Starting health checks', repositoryId, severity: 'INFO' });
    
    const report: HealthReport = {
      status: 'healthy',
      checks: {},
      errors: []
    };

    let hasCritical = false;
    let hasWarning = false;

    for (const check of this.checks) {
      const passed = await check.execute(repositoryId);
      report.checks[check.name] = passed;
      
      if (!passed) {
        const errors = check.getErrors();
        report.errors.push(...errors);
        
        for (const e of errors) {
          if (e.severity === 'critical') hasCritical = true;
          if (e.severity === 'warning') hasWarning = true;
        }
      }
    }

    if (hasCritical) report.status = 'corrupted';
    else if (hasWarning) report.status = 'degraded';

    this.logger.info({ component: 'WorkspaceHealthMonitor', operation: 'runDiagnostics', message: `Health check completed with status: ${report.status}`, repositoryId, severity: 'INFO' });
    
    return report;
  }
}

export const IWorkspaceHealthMonitorToken = Symbol('WorkspaceHealthMonitor');
