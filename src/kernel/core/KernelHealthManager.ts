import { KernelHealth } from '../models/KernelMetrics';
import { KernelEventDispatcher } from './KernelEventDispatcher';
import { KernelEventType } from '../types/KernelEvents';

export class KernelHealthManager {
  private health: KernelHealth = {
    state: 'Running',
    isHealthy: true,
    subsystemStatuses: {},
    lastCheckTimestamp: Date.now()
  };

  constructor(private dispatcher: KernelEventDispatcher) {}

  public async checkHealth(): Promise<KernelHealth> {
    this.health.lastCheckTimestamp = Date.now();
    
    // In a full implementation, this would ping StorageManager, WorkspaceManager, etc.
    // For now we simulate the aggregate health.
    const hasDegraded = Object.values(this.health.subsystemStatuses).some(s => s === 'Degraded' || s === 'Offline');
    
    if (hasDegraded && this.health.isHealthy) {
      this.health.isHealthy = false;
      this.dispatcher.publish(KernelEventType.HealthDegraded, this.health);
    } else if (!hasDegraded) {
      this.health.isHealthy = true;
    }

    return this.health;
  }

  public reportSubsystemStatus(subsystem: string, status: 'Healthy' | 'Degraded' | 'Offline'): void {
    this.health.subsystemStatuses[subsystem] = status;
  }
}
