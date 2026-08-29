import { ContextEngine } from '../../context/core/ContextEngine';
import { ContextPackage } from '../../context/models/ContextPackage';

export class ContextAdapter {
  constructor(private contextEngine: ContextEngine) {}

  public async gatherContext(intent: string): Promise<ContextPackage> {
    return this.contextEngine.buildContext(intent);
  }
}
