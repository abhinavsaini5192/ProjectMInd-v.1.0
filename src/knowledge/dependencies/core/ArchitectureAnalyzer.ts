import { ArchitectureRuleEngine } from './ArchitectureRuleEngine';
import { DependencyRegistry } from './DependencyRegistry';
import { ArchitectureViolation } from '../models/ArchitectureViolation';
import { LayerAnalyzer } from './LayerAnalyzer';

export class ArchitectureAnalyzer {
  constructor(
    private ruleEngine: ArchitectureRuleEngine,
    private layerAnalyzer: LayerAnalyzer
  ) {}

  public analyze(registry: DependencyRegistry): ArchitectureViolation[] {
    // In the future we can perform Layer violations here using layerAnalyzer
    return this.ruleEngine.evaluateAll(registry);
  }
}
