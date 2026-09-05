export class DiscoverySourceError extends Error {
  constructor(public sourceType: string, message: string, public cause?: any) {
    super(`DiscoverySourceError [${sourceType}]: ${message}`);
    this.name = 'DiscoverySourceError';
  }
}
