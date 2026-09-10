import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactType } from '../models/ImpactType.js';
import type { ImpactSeverity } from '../models/ImpactSeverity.js';
import type { ImpactConfidence } from '../models/ImpactConfidence.js';
import type { ImpactEvidence } from '../models/ImpactEvidence.js';
import type { ImpactContext } from './IImpactSource.js';

export interface IImpactClassifier {
  classifyType(candidate: ImpactCandidate, context: ImpactContext): ImpactType;
  classifySeverity(candidate: ImpactCandidate, score: number, context: ImpactContext): ImpactSeverity;
  classifyConfidence(evidence: ImpactEvidence[]): ImpactConfidence;
}
