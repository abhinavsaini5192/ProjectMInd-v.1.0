import { ArchitectureViolation } from '../models/ArchitectureViolation';
import { DependencyRegistry } from './DependencyRegistry';

export interface ArchitectureRule {
  name: string;
  evaluate(registry: DependencyRegistry): ArchitectureViolation[];
}

export class ArchitectureRuleEngine {
  private rules: ArchitectureRule[] = [];

  public registerRule(rule: ArchitectureRule): void {
    this.rules.push(rule);
  }

  public evaluateAll(registry: DependencyRegistry): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    for (const rule of this.rules) {
      violations.push(...rule.evaluate(registry));
    }
    return violations;
  }
}
