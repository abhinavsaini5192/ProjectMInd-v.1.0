import { ReasoningResult, ReasoningValidationStatus } from '../models/ReasoningResult';
import { ContextPackage } from '../../context/models/ContextPackage';
import { SchemaValidator } from './SchemaValidator';
import { EvidenceValidator } from './EvidenceValidator';
import { ConsistencyValidator } from './ConsistencyValidator';
import { ConfidenceValidator } from './ConfidenceValidator';

export interface ValidationReport {
  status: ReasoningValidationStatus;
  valid: boolean;
  issues: string[];
}

export class ReasoningValidator {
  private schemaValidator = new SchemaValidator();
  private evidenceValidator = new EvidenceValidator();
  private consistencyValidator = new ConsistencyValidator();
  private confidenceValidator = new ConfidenceValidator();

  public validate(result: Partial<ReasoningResult>, contextPackage?: ContextPackage): ValidationReport {
    const allIssues: string[] = [];

    const schemaRes = this.schemaValidator.validate(result);
    if (!schemaRes.valid) allIssues.push(...schemaRes.issues);

    const evidenceRes = this.evidenceValidator.validate(result, contextPackage);
    if (!evidenceRes.valid) allIssues.push(...evidenceRes.issues);

    const consistencyRes = this.consistencyValidator.validate(result);
    if (!consistencyRes.valid) allIssues.push(...consistencyRes.issues);

    const confidenceRes = this.confidenceValidator.validate(result);
    if (!confidenceRes.valid) allIssues.push(...confidenceRes.issues);

    let status: ReasoningValidationStatus = 'VALID';
    if (allIssues.length > 0) {
      // If schema or evidence is broken, it's INVALID
      if (!schemaRes.valid || !evidenceRes.valid || !consistencyRes.valid) {
        status = 'INVALID';
      } else {
        status = 'PARTIALLY_VALID';
      }
    }

    return {
      status,
      valid: status === 'VALID',
      issues: allIssues
    };
  }
}
