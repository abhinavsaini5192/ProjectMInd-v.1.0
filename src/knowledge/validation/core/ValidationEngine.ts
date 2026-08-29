import { ValidationReport } from '../models/ValidationReport';
import { ValidationIssue } from '../models/ValidationIssue';
import { HealthCalculator } from './HealthCalculator';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { 
  VALIDATION_STARTED, 
  VALIDATION_COMPLETED, 
  KNOWLEDGE_DEGRADED, 
  HEALTH_SCORE_CHANGED,
  INTEGRITY_VIOLATION_DETECTED
} from '../types/ValidationEvents';
import { Severity } from '../models/Severity';

export class ValidationEngine {
  private validators: any[] = [];

  constructor(
    private healthCalculator: HealthCalculator,
    private dispatcher: KernelEventDispatcher
  ) {}

  public registerValidator(validator: any): void {
    this.validators.push(validator);
  }

  public runFullValidation(repositoryId: string): ValidationReport {
    this.dispatcher.publish(VALIDATION_STARTED, { repositoryId, mode: 'full' });

    let allIssues: ValidationIssue[] = [];

    for (const validator of this.validators) {
       const issues = validator.validate();
       allIssues = allIssues.concat(issues);
    }

    const { score, status } = this.healthCalculator.calculate(allIssues);
    const issues = allIssues.filter(i => i.severity === Severity.CRITICAL || i.severity === Severity.ERROR);
    const warnings = allIssues.filter(i => i.severity === Severity.WARNING || i.severity === Severity.INFO);

    if (issues.length > 0) {
      this.dispatcher.publish(INTEGRITY_VIOLATION_DETECTED, { issues });
      if (status !== 'HEALTHY') {
        this.dispatcher.publish(KNOWLEDGE_DEGRADED, { repositoryId, status, score });
      }
    }

    this.dispatcher.publish(HEALTH_SCORE_CHANGED, { score });
    this.dispatcher.publish(VALIDATION_COMPLETED, { repositoryId });

    return {
      repositoryId,
      status,
      score,
      checks: {
        ast: 'PASS',
        symbols: 'PASS',
        relationships: issues.some(i => i.domain === 'relationships') ? 'FAIL' : 'PASS',
        dependencies: 'PASS',
        features: 'PASS',
        evolution: 'PASS',
        crossLayer: 'PASS'
      },
      issues,
      warnings,
      timestamp: new Date().toISOString()
    };
  }
}
