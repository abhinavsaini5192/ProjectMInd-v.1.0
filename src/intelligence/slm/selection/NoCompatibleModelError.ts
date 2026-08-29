import { ModelRequirements } from '../models/ModelRequirements';
import { RejectedModel } from '../models/ModelSelectionResult';

export class NoCompatibleModelError extends Error {
  constructor(public requirements: ModelRequirements, public rejected: RejectedModel[]) {
    const reasons = rejected.map(r => `  - ${r.modelId}: ${r.reason}`).join('\n');
    super(`No compatible model found for requirements.\nRequirements: ${JSON.stringify(requirements)}\nRejected:\n${reasons}`);
    this.name = 'NoCompatibleModelError';
  }
}
