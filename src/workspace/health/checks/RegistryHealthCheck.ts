import { IHealthCheck } from './IHealthCheck';
import { IRegistryStore } from '../interfaces/storage/IRegistryStore';
import { ILogger } from '../interfaces/ILogger';

export class RegistryHealthCheck implements IHealthCheck {
  name = 'RegistryHealthCheck';
  private errors: any[] = [];

  constructor(private registryStore: IRegistryStore, private logger: ILogger) {}

  async execute(): Promise<boolean> {
    this.errors = [];
    try {
      const all = await this.registryStore.listAll();
      if (!all) {
         this.errors.push({ code: 'REG_01', message: 'Registry returned null', severity: 'critical' });
         return false;
      }
      return true;
    } catch (err: any) {
      this.logger.error({ component: this.name, operation: 'execute', message: err.message, severity: 'ERROR' });
      this.errors.push({ code: 'REG_02', message: `Registry query failed: ${err.message}`, severity: 'critical' });
      return false;
    }
  }

  getErrors() {
    return this.errors;
  }
}
