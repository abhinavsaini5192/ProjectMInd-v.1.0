export class FeatureMappingError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = 'FeatureMappingError';
  }
}
