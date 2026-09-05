import type { DiscoverySourceType, DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';

export interface IFeatureDiscoverySource {
  readonly sourceType: DiscoverySourceType;
  readonly name: string;
  discover(context: DiscoveryContext): Promise<DiscoveryEvidence[]> | DiscoveryEvidence[];
}
