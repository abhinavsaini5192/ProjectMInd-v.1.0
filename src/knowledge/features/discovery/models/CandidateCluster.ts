import type { DiscoveryEvidence } from './DiscoveryEvidence';

export interface CandidateCluster {
  clusterKey: string;
  normalizedName: string;
  evidence: DiscoveryEvidence[];
  associatedResourceIds: string[];
}
