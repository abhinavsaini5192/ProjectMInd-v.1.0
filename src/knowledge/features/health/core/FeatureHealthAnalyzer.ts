import type { IFeatureHealthAnalyzer } from '../interfaces/IFeatureHealthAnalyzer.js';
import type { HealthContext, IFeatureHealthSignal } from '../interfaces/IFeatureHealthSignal.js';
import type { FeatureHealth } from '../models/FeatureHealth.js';
import type { FeatureHealthScore } from '../models/FeatureHealthScore.js';
import type { RiskAssessment } from '../models/RiskAssessment.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { HealthRecommendation, HealthRecommendationCategory, HealthRecommendationPriority } from '../models/HealthRecommendation.js';
import type { FeatureHealthConflict } from '../models/FeatureHealthConflict.js';
import type { HealthAnalysisMode } from '../models/FeatureHealthVersion.js';
import { FeatureHealthScorer } from './FeatureHealthScorer.js';
import { FeatureRiskDetector } from './FeatureRiskDetector.js';
import { FeatureHealthValidator } from './FeatureHealthValidator.js';
import { ComplexityHealthSignal } from '../signals/ComplexityHealthSignal.js';
import { CouplingHealthSignal } from '../signals/CouplingHealthSignal.js';
import { DependencyHealthSignal } from '../signals/DependencyHealthSignal.js';
import { VerificationHealthSignal } from '../signals/VerificationHealthSignal.js';
import { BehaviorHealthSignal } from '../signals/BehaviorHealthSignal.js';
import { ArchitectureHealthSignal } from '../signals/ArchitectureHealthSignal.js';
import { StabilityHealthSignal } from '../signals/StabilityHealthSignal.js';
import { ChangeFrequencyHealthSignal } from '../signals/ChangeFrequencyHealthSignal.js';
import { IntegrationHealthSignal } from '../signals/IntegrationHealthSignal.js';
import { SecurityHealthSignal } from '../signals/SecurityHealthSignal.js';
import { ConfidenceHealthSignal } from '../signals/ConfidenceHealthSignal.js';
import { ResourceHealthSignal } from '../signals/ResourceHealthSignal.js';
import { HealthSignalHelper } from '../signals/HealthSignalHelper.js';

export class FeatureHealthAnalyzer implements IFeatureHealthAnalyzer {
  private signalProviders: IFeatureHealthSignal[];
  private riskDetector: FeatureRiskDetector;
  private scorer: FeatureHealthScorer;

  constructor(options?: {
    signalProviders?: IFeatureHealthSignal[];
    riskDetector?: FeatureRiskDetector;
    scorer?: FeatureHealthScorer;
  }) {
    this.signalProviders = options?.signalProviders || [
      new ComplexityHealthSignal(),
      new CouplingHealthSignal(),
      new DependencyHealthSignal(),
      new VerificationHealthSignal(),
      new BehaviorHealthSignal(),
      new ArchitectureHealthSignal(),
      new StabilityHealthSignal(),
      new ChangeFrequencyHealthSignal(),
      new IntegrationHealthSignal(),
      new SecurityHealthSignal(),
      new ConfidenceHealthSignal(),
      new ResourceHealthSignal()
    ];
    this.riskDetector = options?.riskDetector || new FeatureRiskDetector();
    this.scorer = options?.scorer || new FeatureHealthScorer();
  }

  public async analyzeFeature(context: HealthContext, mode: HealthAnalysisMode = 'FULL'): Promise<FeatureHealth> {
    const featureId = (context.feature as any).featureId || context.feature.id;

    // 1. Run all health signal providers
    const allSignals: HealthSignal[] = [];
    for (const provider of this.signalProviders) {
      try {
        const signals = await provider.compute(context);
        allSignals.push(...signals);
      } catch (err) {
        console.warn(`[FeatureHealthAnalyzer] Signal provider ${provider.id} error:`, err);
      }
    }

    // 2. Run risk detector service
    const risks = await this.riskDetector.detectAll(context, allSignals);

    // 3. Score dimensions and aggregate health score
    const dimensionScores = this.scorer.scoreDimensions(allSignals, context.config);
    const healthScore = this.scorer.calculateOverallHealth(dimensionScores);
    const riskAssessment = this.scorer.assessRisks(risks);
    const criticality = this.scorer.calculateCriticality(context);
    const stability = this.scorer.calculateStability(context, allSignals);
    const verificationQuality = this.scorer.calculateVerificationQuality(context, allSignals);

    // 4. Generate recommendations
    const recommendations = this.generateRecommendations(healthScore, riskAssessment, allSignals);

    // 5. Detect conflicts
    const conflicts = this.detectConflicts(allSignals, risks);

    // 6. Assemble FeatureHealth aggregate
    const now = Date.now();
    const health: FeatureHealth = {
      healthId: `health_${featureId}_${now}`,
      featureId,
      healthScore,
      riskAssessment,
      criticality,
      stability,
      verificationQuality,
      recommendations,
      signals: allSignals,
      conflicts,
      version: {
        healthVersion: '1.0.0',
        knowledgeVersion: '6.6.0',
        analyzedAt: now,
        analysisMode: mode,
        featureId,
        healthId: `health_${featureId}_${now}`
      },
      metadata: {
        analyzedAt: now,
        mode
      },
      isStale: false,
      createdAt: now,
      updatedAt: now
    };

    // 7. Validate health aggregate
    FeatureHealthValidator.assertValidFeatureHealth(health);

    return health;
  }

  public generateRecommendations(
    healthScore: FeatureHealthScore,
    riskAssessment: RiskAssessment,
    signals: HealthSignal[]
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    // Security recommendations
    const secRisks = riskAssessment.risks.filter((r) => r.riskType === 'SECURITY');
    if (secRisks.length > 0) {
      const hasSecret = signals.some((s) => s.signalType === 'EXPOSED_SECRET');
      const hasMissingAuth = signals.some((s) => s.signalType === 'MISSING_AUTHENTICATION');

      if (hasSecret) {
        recommendations.push({
          recommendationId: `rec_sec_secret_${Date.now()}`,
          featureId: secRisks[0].featureId,
          category: 'SECURITY',
          priority: 'CRITICAL',
          title: 'Remediate hardcoded credentials immediately',
          description: 'Potential secret patterns were detected in feature resources. Rotate keys and migrate credentials to secure environment variables.',
          actionableSteps: [
            'Revoke and cycle exposed credentials or tokens',
            'Move secrets to environment variables (.env) or a secret manager',
            'Add pre-commit secret scanning hooks to prevent leakage'
          ],
          evidence: secRisks[0].evidence,
          relatedRiskIds: [secRisks[0].riskId],
          confidence: 0.98,
          createdAt: Date.now()
        });
      }

      if (hasMissingAuth) {
        recommendations.push({
          recommendationId: `rec_sec_auth_${Date.now()}`,
          featureId: secRisks[0].featureId,
          category: 'SECURITY',
          priority: 'CRITICAL',
          title: 'Attach authentication guards to endpoints',
          description: 'Sensitive endpoints mapped to this feature lack authentication or authorization middlewares.',
          actionableSteps: [
            'Enforce authentication middleware (JWT / Session) on all sensitive route handlers',
            'Verify RBAC or permission policies before executing controller handlers'
          ],
          evidence: secRisks[0].evidence,
          relatedRiskIds: [secRisks[0].riskId],
          confidence: 0.95,
          createdAt: Date.now()
        });
      }
    }

    // Circular dependency & Architecture recommendations
    const circRisks = riskAssessment.risks.filter((r) => r.riskType === 'CIRCULAR_DEPENDENCY');
    if (circRisks.length > 0) {
      recommendations.push({
        recommendationId: `rec_arch_circ_${Date.now()}`,
        featureId: circRisks[0].featureId,
        category: 'ARCHITECTURE',
        priority: 'CRITICAL',
        title: 'Break circular feature dependency cycle',
        description: 'This feature is part of a circular dependency path which violates DAG layering and prevents clean isolation.',
        actionableSteps: [
          'Extract shared data contracts into a domain kernel or shared interface module',
          'Invert the dependency using dependency injection or domain events'
        ],
        evidence: circRisks[0].evidence,
        relatedRiskIds: [circRisks[0].riskId],
        confidence: 0.98,
        createdAt: Date.now()
      });
    }

    // Testing recommendations
    const verifRisks = riskAssessment.risks.filter((r) => r.riskType === 'VERIFICATION');
    if (verifRisks.length > 0) {
      const priority: HealthRecommendationPriority =
        verifRisks[0].severity === 'CRITICAL' ? 'CRITICAL' : verifRisks[0].severity === 'HIGH' ? 'HIGH' : 'MEDIUM';

      recommendations.push({
        recommendationId: `rec_verif_${Date.now()}`,
        featureId: verifRisks[0].featureId,
        category: 'TESTING',
        priority,
        title: 'Author comprehensive automated tests for feature',
        description: 'Test coverage or critical execution flows lack sufficient test verification.',
        actionableSteps: [
          'Add unit tests covering edge cases and branch logic',
          'Add integration tests targeting all exposed API endpoints',
          'Ensure assertions verify error states and boundary conditions'
        ],
        evidence: verifRisks[0].evidence,
        relatedRiskIds: [verifRisks[0].riskId],
        confidence: 0.95,
        createdAt: Date.now()
      });
    }

    // Complexity & Refactoring recommendations
    const compRisks = riskAssessment.risks.filter((r) => r.riskType === 'COMPLEXITY');
    if (compRisks.length > 0) {
      recommendations.push({
        recommendationId: `rec_comp_${Date.now()}`,
        featureId: compRisks[0].featureId,
        category: 'REFACTORING',
        priority: compRisks[0].severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
        title: 'Refactor complex methods and reduce nesting depth',
        description: 'High cyclomatic complexity and deep indentation were detected, impeding maintainability.',
        actionableSteps: [
          'Extract nested blocks into helper functions with clear single responsibilities',
          'Flatten deeply nested conditionals using guard clauses and early returns'
        ],
        evidence: compRisks[0].evidence,
        relatedRiskIds: [compRisks[0].riskId],
        confidence: 0.9,
        createdAt: Date.now()
      });
    }

    // Stability recommendations
    const stabRisks = riskAssessment.risks.filter((r) => r.riskType === 'STABILITY');
    if (stabRisks.length > 0) {
      recommendations.push({
        recommendationId: `rec_stab_${Date.now()}`,
        featureId: stabRisks[0].featureId,
        category: 'STABILIZATION',
        priority: 'MEDIUM',
        title: 'Stabilize high-churn codebase hotspot',
        description: 'This feature undergoes unusually frequent churn and bug fixes, pointing to underlying volatility.',
        actionableSteps: [
          'Review recent defect root causes to identify systematic design weaknesses',
          'Lock down behavioral expectations with regression tests before modifying further'
        ],
        evidence: stabRisks[0].evidence,
        relatedRiskIds: [stabRisks[0].riskId],
        confidence: 0.88,
        createdAt: Date.now()
      });
    }

    return recommendations;
  }

  public detectConflicts(signals: HealthSignal[], risks: FeatureRisk[]): FeatureHealthConflict[] {
    const conflicts: FeatureHealthConflict[] = [];

    // Conflict: High test ratio or verified tests, but severe error/defect signals exist
    const hasMissingTests = signals.some((s) => s.signalType === 'MISSING_TESTS');
    const hasHighVerification = signals.some(
      (s) => s.signalType === 'ASSERTION_FREE_TEST' || s.signalType === 'FLAKY_TEST_HISTORY'
    );

    if (hasMissingTests && hasHighVerification) {
      conflicts.push({
        conflictId: `conf_test_${Date.now()}`,
        featureId: signals[0]?.featureId || 'unknown',
        conflictType: 'INCONSISTENT_METRIC',
        description: 'Inconsistent test metric: Tests are flagged both as missing and as flaky/assertion-free.',
        competingEvidence: [
          ...signals.filter((s) => s.signalType === 'MISSING_TESTS').flatMap((s) => s.evidence),
          ...signals.filter((s) => s.signalType === 'FLAKY_TEST_HISTORY').flatMap((s) => s.evidence)
        ],
        severity: 'MEDIUM',
        confidence: 0.85,
        resolutionStatus: 'UNRESOLVED',
        detectedAt: Date.now()
      });
    }

    return conflicts;
  }
}
