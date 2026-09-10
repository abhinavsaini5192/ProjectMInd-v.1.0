import type { ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactResult, ImpactStatistics } from '../models/ImpactResult.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ImpactCandidateGenerator } from './ImpactCandidateGenerator.js';
import { ImpactPropagationEngine } from './ImpactPropagationEngine.js';
import { ImpactScorer } from './ImpactScorer.js';
import { ImpactClassifier } from './ImpactClassifier.js';
import { ImpactValidator } from './ImpactValidator.js';
import { ImpactNormalizer } from './ImpactNormalizer.js';

export interface AnalyzerDependencies {
  candidateGenerator?: ImpactCandidateGenerator;
  propagationEngine?: ImpactPropagationEngine;
  scorer?: ImpactScorer;
  classifier?: ImpactClassifier;
  validator?: ImpactValidator;
}

export class FeatureImpactAnalyzer {
  private candidateGenerator: ImpactCandidateGenerator;
  private propagationEngine: ImpactPropagationEngine;
  private scorer: ImpactScorer;
  private classifier: ImpactClassifier;
  private validator: ImpactValidator;

  constructor(deps: AnalyzerDependencies = {}) {
    this.candidateGenerator = deps.candidateGenerator || new ImpactCandidateGenerator();
    this.propagationEngine = deps.propagationEngine || new ImpactPropagationEngine();
    this.scorer = deps.scorer || new ImpactScorer();
    this.classifier = deps.classifier || new ImpactClassifier();
    this.validator = deps.validator || new ImpactValidator();
  }

  public async analyze(context: ImpactContext): Promise<ImpactResult> {
    const startedAt = Date.now();
    const runId = `run_imp_${startedAt}_${Math.random().toString(36).slice(2, 7)}`;

    // 1. Generate initial candidates from sources
    const initialCandidates = await this.candidateGenerator.generateCandidates(context);

    // 2. Propagate through graph & flows
    const propResult = await this.propagationEngine.propagate(initialCandidates, context);

    const allCandidates: ImpactCandidate[] = [
      ...initialCandidates,
      ...propResult.propagatedCandidates,
    ];
    const allPaths: ImpactPath[] = [...propResult.generatedPaths];

    // 3. Score and classify all candidates
    for (const cand of allCandidates) {
      cand.score = this.scorer.scoreImpact(cand, context);
      cand.impactType = this.classifier.classifyType(cand, context);
      cand.severity = this.classifier.classifySeverity(cand, cand.score, context);
      cand.confidence = this.classifier.classifyConfidence(cand.evidence);
    }

    // 4. Validate candidates and detect conflicts
    const validatedCandidates: ImpactCandidate[] = [];
    for (const cand of allCandidates) {
      const val = this.validator.validateCandidate(cand, context);
      if (val.valid) {
        cand.status = 'VALIDATED';
        validatedCandidates.push(cand);
      } else {
        cand.status = 'REJECTED';
        cand.rejectionReason = val.errors.join('; ');
      }
    }

    const conflicts = this.validator.detectConflicts(validatedCandidates, context);

    // 5. Normalize into logical FeatureImpacts and ResourceImpacts
    const rawFeatureImpacts = ImpactNormalizer.normalizeFeatureCandidates(validatedCandidates, context);
    const featureImpacts = this.scorer.prioritizeImpacts(rawFeatureImpacts);

    const resourceImpacts = ImpactNormalizer.normalizeResourceCandidates(validatedCandidates, context);

    const directImpacts = featureImpacts.filter((f) => f.direct);
    const indirectImpacts = featureImpacts.filter((f) => !f.direct);

    // 6. Calculate statistics
    const completedAt = Date.now();
    const highImpactCount = featureImpacts.filter((f) => f.severity === 'HIGH').length;
    const criticalImpactCount = featureImpacts.filter((f) => f.severity === 'CRITICAL').length;
    const verificationImpactCount = resourceImpacts.filter((r) => r.impactType === 'VERIFICATION').length;

    const statistics: ImpactStatistics = {
      changesAnalyzed: context.changes.length,
      resourcesAffected: resourceImpacts.length,
      featuresAffected: featureImpacts.length,
      directImpactCount: directImpacts.length,
      indirectImpactCount: indirectImpacts.length,
      highImpactCount,
      criticalImpactCount,
      verificationImpactCount,
      conflictsDetected: conflicts.length,
      pathsGenerated: allPaths.length,
      maxDepthReached: propResult.maxDepthReached,
      skippedNodes: propResult.skippedNodes,
      analysisDuration: completedAt - startedAt,
    };

    return {
      runId,
      repositoryId: context.repositoryId,
      analysisMode: context.options.analysisMode || 'FULL',
      sourceChanges: context.changes,
      directImpacts,
      indirectImpacts,
      resourceImpacts,
      featureImpacts,
      impactPaths: allPaths,
      conflicts,
      staleImpacts: [],
      statistics,
      version: {
        impactVersion: 1,
        knowledgeVersion: context.options.sourceChangeVersion || '1.0.0',
        sourceChangeVersion: context.options.sourceChangeVersion || '1.0.0',
        analyzedAt: completedAt,
        analysisMode: context.options.analysisMode || 'FULL',
      },
      startedAt,
      completedAt,
    };
  }
}
