import { FeatureError } from './FeatureError';

export class FeatureConflictError extends FeatureError {
  constructor(message: string, public conflictDetails?: Record<string, any>) {
    super(`FeatureConflictError: ${message}`, conflictDetails);
    this.name = 'FeatureConflictError';
  }
}
