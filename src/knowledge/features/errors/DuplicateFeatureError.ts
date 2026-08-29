import { FeatureError } from './FeatureError';

export class DuplicateFeatureError extends FeatureError {
  constructor(public identifier: string) {
    super(`Duplicate feature detected: "${identifier}" is already registered`, { identifier });
    this.name = 'DuplicateFeatureError';
  }
}
