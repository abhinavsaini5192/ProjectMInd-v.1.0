import { FeatureError } from './FeatureError';

export class InvalidFeatureError extends FeatureError {
  constructor(message: string, public validationIssues: string[]) {
    super(`Invalid feature: ${message} -> [${validationIssues.join('; ')}]`, { validationIssues });
    this.name = 'InvalidFeatureError';
  }
}
