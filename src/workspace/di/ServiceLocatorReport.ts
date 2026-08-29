import { DIContainer } from './DIContainer';
import { ILogger } from '../interfaces/ILogger';

export class ServiceLocatorReport {
  constructor(private container: DIContainer, private logger: ILogger) {}

  generateReport(): void {
    const descriptors = this.container.getDescriptors();
    
    this.logger.info({
      component: 'ServiceLocatorReport',
      operation: 'generateReport',
      message: '--- Dependency Injection Service Locator Report ---'
    });

    for (const desc of descriptors) {
      const deps = desc.dependencies.map(d => String(d.description)).join(', ') || 'None';
      const implName = desc.implementation ? desc.implementation.name : (desc.factory ? '[Factory]' : 'Unknown');
      const resolutionStatus = desc.instance ? 'Resolved (Instance cached)' : 'Lazy/Unresolved';

      this.logger.info({
        component: 'ServiceLocatorReport',
        operation: 'generateReport',
        message: `Token: ${String(desc.token.description)}`,
        details: {
          lifetime: desc.lifetime,
          implementation: implName,
          dependencies: deps,
          status: resolutionStatus
        }
      });
    }

    this.logger.info({
      component: 'ServiceLocatorReport',
      operation: 'generateReport',
      message: '--- End of Report ---'
    });
  }
}
