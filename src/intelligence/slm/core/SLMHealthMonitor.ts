import { ISLMProvider } from '../providers/ISLMProvider';

export enum HealthState {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNAVAILABLE = 'UNAVAILABLE',
  UNKNOWN = 'UNKNOWN'
}

export class SLMHealthMonitor {
  private currentState: HealthState = HealthState.UNKNOWN;

  public async checkHealth(provider: ISLMProvider): Promise<HealthState> {
    try {
      const isHealthy = await provider.healthCheck();
      this.currentState = isHealthy ? HealthState.HEALTHY : HealthState.UNAVAILABLE;
    } catch (e) {
      this.currentState = HealthState.UNAVAILABLE;
    }
    return this.currentState;
  }

  public getState(): HealthState {
    return this.currentState;
  }
}
