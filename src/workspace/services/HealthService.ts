import { WorkspaceHealthMonitor } from '../health/WorkspaceHealthMonitor';
import { HealthReport } from '../health/IHealthCheck';

export class HealthService {
  constructor(private monitor: WorkspaceHealthMonitor) {}

  async checkHealth(repositoryId?: string): Promise<HealthReport> {
    return this.monitor.runDiagnostics(repositoryId);
  }
}

export const IHealthServiceToken = Symbol('HealthService');
