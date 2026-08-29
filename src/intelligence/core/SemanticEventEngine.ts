import { SemanticEvent, SemanticEventType } from '../models/SemanticEvent';
import { FeatureDetector } from './FeatureDetector';
import { BreakingChangeDetector } from './BreakingChangeDetector';
import { RefactorDetector } from './RefactorDetector';
import { DependencyAnalyzer } from './DependencyAnalyzer';
import { ASTChange } from '../models/RepositoryChange';

import crypto from 'crypto';

export class SemanticEventEngine {
  constructor(
    private featureDetector: FeatureDetector,
    private breakingChangeDetector: BreakingChangeDetector,
    private refactorDetector: RefactorDetector,
    private dependencyAnalyzer: DependencyAnalyzer
  ) {}

  public generateEvents(
    astChanges: ASTChange[],
    exportedSymbols: Set<string>,
    oldDeps: Record<string, string>,
    newDeps: Record<string, string>
  ): SemanticEvent[] {
    const events: SemanticEvent[] = [];
    const timestamp = new Date().toISOString();

    // Detect breaking changes
    const breaking = this.breakingChangeDetector.detect(astChanges, exportedSymbols);
    for (const b of breaking) {
      events.push({
        id: crypto.randomUUID(),
        type: SemanticEventType.BreakingChange,
        timestamp,
        description: b.reason,
        confidence: 1.0,
        metadata: { symbol: b.symbolName, file: b.filePath },
        impact: [b.filePath] // Placeholder, ImpactAnalyzer handles real impact
      });
    }

    // Detect dependencies
    const depChanges = this.dependencyAnalyzer.analyze(oldDeps, newDeps);
    if (depChanges.length > 0) {
      events.push({
        id: crypto.randomUUID(),
        type: SemanticEventType.DependencyUpdated,
        timestamp,
        description: `Updated ${depChanges.length} dependencies`,
        confidence: 1.0,
        metadata: { changes: depChanges },
        impact: []
      });
    }

    // Detect Refactors
    const refactors = this.refactorDetector.detect(astChanges, exportedSymbols);
    // If it's a pure refactor (and no breaking changes), we emit it
    if (refactors.length > 0 && breaking.length === 0) {
      const pureRefactors = refactors.filter(r => r.isPure);
      if (pureRefactors.length > 0) {
        events.push({
          id: crypto.randomUUID(),
          type: SemanticEventType.Refactored,
          timestamp,
          description: pureRefactors[0].description,
          confidence: 0.9,
          metadata: { files: pureRefactors[0].filesInvolved },
          impact: pureRefactors[0].filesInvolved
        });
      } else {
        // If it wasn't pure, it might be a feature
        const features = this.featureDetector.detect(astChanges);
        if (features.length > 0) {
          events.push({
            id: crypto.randomUUID(),
            type: SemanticEventType.FeatureAdded,
            timestamp,
            description: features[0].featureName,
            confidence: 0.8,
            metadata: { files: features[0].relatedFiles },
            impact: features[0].relatedFiles
          });
        }
      }
    }

    return events;
  }
}
