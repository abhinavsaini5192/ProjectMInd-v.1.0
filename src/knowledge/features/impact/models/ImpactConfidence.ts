export type ImpactConfidence =
  | 'VERY_HIGH'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'UNKNOWN';

export const ALL_IMPACT_CONFIDENCES: readonly ImpactConfidence[] = [
  'VERY_HIGH',
  'HIGH',
  'MEDIUM',
  'LOW',
  'UNKNOWN',
] as const;

export function isValidImpactConfidence(conf: string): conf is ImpactConfidence {
  return ALL_IMPACT_CONFIDENCES.includes(conf as ImpactConfidence);
}

export function confidenceToNumeric(confidence: ImpactConfidence): number {
  switch (confidence) {
    case 'VERY_HIGH':
      return 0.95;
    case 'HIGH':
      return 0.8;
    case 'MEDIUM':
      return 0.6;
    case 'LOW':
      return 0.35;
    case 'UNKNOWN':
    default:
      return 0.1;
  }
}

export function numericToConfidence(score: number): ImpactConfidence {
  if (score >= 0.9) return 'VERY_HIGH';
  if (score >= 0.75) return 'HIGH';
  if (score >= 0.5) return 'MEDIUM';
  if (score >= 0.25) return 'LOW';
  return 'UNKNOWN';
}
