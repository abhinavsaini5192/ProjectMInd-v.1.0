import { CapabilityProvider } from '../interfaces';

/**
 * Manages and advertises AI capabilities provided by the platform.
 */
export class CapabilityDiscovery {
  private capabilities: Set<string> = new Set();
  
  constructor() {
    // Default capabilities built into the platform
    this.register('SupportsContextPlanning');
    this.register('SupportsSnapshots');
    this.register('SupportsKnowledgeGraph');
  }

  public register(capability: string): void {
    this.capabilities.add(capability);
  }
  
  public getCapabilities(): CapabilityProvider {
    return {
      name: 'ProjectMind',
      version: '1.0.0',
      features: Array.from(this.capabilities)
    };
  }
}
