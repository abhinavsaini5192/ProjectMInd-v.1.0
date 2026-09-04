export type InformationGapSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface InformationGap {
  gapId: string;
  subtaskId: string;
  description: string;
  severity: InformationGapSeverity;
  blocking: boolean;
  confidence: number;
  requiredEvidence: string;
  resolved: boolean;
}
