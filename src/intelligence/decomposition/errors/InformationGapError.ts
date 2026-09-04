import { DecompositionError } from './DecompositionError';

export class InformationGapError extends DecompositionError {
  constructor(message: string, public gapId: string, public blocking: boolean) {
    super(`Unresolved Information Gap [${gapId}]: ${message}`, { gapId, blocking });
    this.name = 'InformationGapError';
  }
}
