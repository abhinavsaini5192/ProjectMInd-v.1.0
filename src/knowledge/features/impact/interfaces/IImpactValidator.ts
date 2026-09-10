import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactConflict } from '../models/ImpactConflict.js';
import type { ImpactContext } from './IImpactSource.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface SecurityCheckResult {
  safe: boolean;
  detectedPatterns: string[];
  sanitizedText?: string;
}

export interface IImpactValidator {
  validateCandidate(candidate: ImpactCandidate, context: ImpactContext): ValidationResult;
  detectConflicts(candidates: ImpactCandidate[], context: ImpactContext): ImpactConflict[];
  validateSecurity(input: string): SecurityCheckResult;
}
