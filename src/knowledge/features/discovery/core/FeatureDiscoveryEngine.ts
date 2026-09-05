import { randomUUID } from 'crypto';
import type { IFeatureDiscoveryEngine } from '../interfaces/IFeatureDiscoveryEngine';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryResult, DiscoveryStatistics } from '../models/DiscoveryResult';
import type { FeatureCandidate } from '../models/FeatureCandidate';
import type { Feature } from '../../models/Feature';
import { createDefaultFeature } from '../../models/Feature';
import { FeatureOrigin } from '../../models/FeatureOrigin';
import { FeatureStatus } from '../../models/FeatureStatus';
import { FeatureConfidenceLevel } from '../../models/FeatureConfidence';
import { FeatureRegistry } from '../../core/FeatureRegistry';
import { FeatureDiscoveryCoordinator } from './FeatureDiscoveryCoordinator';
import { CandidateRanker } from '../ranking/CandidateRanker';
import { FeatureDiscoveryError } from '../errors/FeatureDiscoveryError';
import { CandidateValidationError } from '../errors/CandidateValidationError';
import {
  FEATURE_DISCOVERY_STARTED,
  FEATURE_CANDIDATE_DETECTED,
  FEATURE_CANDIDATE_PROMOTED,
  FEATURE_CANDIDATE_REJECTED,
  FEATURE_DISCOVERY_COMPLETED,
  FEATURE_DISCOVERY_CONFLICT_DETECTED,
} from '../events/FeatureDiscoveryEvents';

// Default sources
import { EndpointFeatureSource } from '../sources/EndpointFeatureSource';
import { ModuleFeatureSource } from '../sources/ModuleFeatureSource';
import { SymbolFeatureSource } from '../sources/SymbolFeatureSource';
import { DependencyFeatureSource } from '../sources/DependencyFeatureSource';
import { TestFeatureSource } from '../sources/TestFeatureSource';
import { ConfigurationFeatureSource } from '../sources/ConfigurationFeatureSource';
import { DocumentationFeatureSource } from '../sources/DocumentationFeatureSource';
import { HistoryFeatureSource } from '../sources/HistoryFeatureSource';

export interface EventPublisher {
  publish(event: string, payload: any): void;
}

export class FeatureDiscoveryEngine implements IFeatureDiscoveryEngine {
  private coordinator: FeatureDiscoveryCoordinator;
  private ranker = new CandidateRanker();
  private candidateStore = new Map<string, FeatureCandidate>();
  private runHistory = new Map<string, DiscoveryResult>();

  constructor(
    private registry: FeatureRegistry = new FeatureRegistry(),
    coordinator?: FeatureDiscoveryCoordinator,
    private eventPublisher?: EventPublisher
  ) {
    if (coordinator) {
      this.coordinator = coordinator;
    } else {
      this.coordinator = new FeatureDiscoveryCoordinator();
    }
  }

  public async discoverFeatures(context: DiscoveryContext): Promise<DiscoveryResult> {
    const startedAt = Date.now();
    const runId = `run_${randomUUID().slice(0, 8)}`;

    this.emit(FEATURE_DISCOVERY_STARTED, {
      runId,
      repositoryId: context.repositoryId,
      timestamp: startedAt,
    });

    const coordResult = await this.coordinator.coordinate(context);
    const rankedCandidates = this.ranker.rank(coordResult.candidates);

    for (const c of rankedCandidates) {
      this.candidateStore.set(c.candidateId, c);
      this.emit(FEATURE_CANDIDATE_DETECTED, {
        candidateId: c.candidateId,
        proposedName: c.proposedName,
        score: c.score,
        confidence: c.confidence.level,
      });
    }

    if (coordResult.conflicts.length > 0) {
      this.emit(FEATURE_DISCOVERY_CONFLICT_DETECTED, {
        runId,
        conflictCount: coordResult.conflicts.length,
      });
    }

    // Process promotions and manual feature protection
    const promotedFeatures: Feature[] = [];
    const rejectedCandidates: FeatureCandidate[] = [];

    for (const candidate of rankedCandidates) {
      if (candidate.status === 'VALIDATED') {
        const feature = await this.promoteCandidateInternal(candidate);
        promotedFeatures.push(feature);
      } else if (candidate.status === 'REJECTED') {
        rejectedCandidates.push(candidate);
      }
    }

    const completedAt = Date.now();
    const statistics: DiscoveryStatistics = {
      evidenceCount: coordResult.evidence.length,
      candidateCount: rankedCandidates.length,
      promotedCount: promotedFeatures.length,
      rejectedCount: rejectedCandidates.length,
      conflictCount: coordResult.conflicts.length,
      duplicateCount: coordResult.conflicts.filter((c) => c.type === 'RESOURCE_COLLISION').length,
      slmCalls: 0,
      tokensUsed: 0,
      durationMs: completedAt - startedAt,
    };

    const result: DiscoveryResult = {
      runId,
      repositoryId: context.repositoryId,
      mode: 'FULL',
      startedAt,
      completedAt,
      candidates: rankedCandidates,
      promotedFeatures,
      rejectedCandidates,
      conflicts: coordResult.conflicts,
      statistics,
    };

    this.runHistory.set(runId, result);

    this.emit(FEATURE_DISCOVERY_COMPLETED, {
      runId,
      repositoryId: context.repositoryId,
      statistics,
      timestamp: completedAt,
    });

    return result;
  }

  public async discoverFeatureCandidates(context: DiscoveryContext): Promise<FeatureCandidate[]> {
    const result = await this.discoverFeatures(context);
    return result.candidates;
  }

  public registerCandidate(candidate: FeatureCandidate): void {
    this.candidateStore.set(candidate.candidateId, candidate);
  }

  public getCandidate(candidateId: string): FeatureCandidate | undefined {
    return this.candidateStore.get(candidateId);
  }

  public listCandidates(): FeatureCandidate[] {
    return Array.from(this.candidateStore.values());
  }

  public async validateCandidate(candidateId: string): Promise<{ valid: boolean; issues: string[] }> {
    const candidate = this.candidateStore.get(candidateId);
    if (!candidate) {
      throw new FeatureDiscoveryError(`Candidate "${candidateId}" not found`);
    }

    const issues: string[] = [];
    if (candidate.score < 0.20) {
      issues.push(`Confidence score (${candidate.score}) is below minimum threshold`);
    }
    if (candidate.evidence.length === 0) {
      issues.push('Candidate has zero supporting evidence');
    }
    const hasCritical = candidate.conflicts.some((c) => c.severity === 'CRITICAL' && !c.resolved);
    if (hasCritical) {
      issues.push('Candidate has unresolved critical conflicts');
    }

    const valid = issues.length === 0;
    candidate.status = valid ? 'VALIDATED' : 'REJECTED';
    return { valid, issues };
  }

  public async promoteCandidate(candidateId: string): Promise<Feature> {
    const candidate = this.candidateStore.get(candidateId);
    if (!candidate) {
      throw new FeatureDiscoveryError(`Candidate "${candidateId}" not found`);
    }

    if (candidate.status === 'REJECTED') {
      throw new CandidateValidationError(candidateId, ['Cannot promote a rejected candidate']);
    }

    const feature = await this.promoteCandidateInternal(candidate);
    return feature;
  }

  public async rejectCandidate(candidateId: string, reason: string): Promise<void> {
    const candidate = this.candidateStore.get(candidateId);
    if (!candidate) {
      throw new FeatureDiscoveryError(`Candidate "${candidateId}" not found`);
    }

    candidate.status = 'REJECTED';
    if (!candidate.metadata) candidate.metadata = {};
    candidate.metadata.rejectionReason = reason;

    this.emit(FEATURE_CANDIDATE_REJECTED, {
      candidateId,
      proposedName: candidate.proposedName,
      reason,
    });
  }

  public explainCandidate(candidateId: string): Record<string, any> {
    const candidate = this.candidateStore.get(candidateId);
    if (!candidate) {
      throw new FeatureDiscoveryError(`Candidate "${candidateId}" not found`);
    }

    return {
      candidateId: candidate.candidateId,
      proposedName: candidate.proposedName,
      proposedDescription: candidate.proposedDescription,
      score: candidate.score,
      confidence: candidate.confidence,
      sources: candidate.sources,
      evidenceCount: candidate.evidence.length,
      evidence: candidate.evidence.map((e) => ({
        sourceType: e.sourceType,
        sourceId: e.sourceId,
        strength: e.strength,
        description: e.description,
        confidence: e.confidence,
      })),
      references: candidate.references.map((r) => ({
        resourceId: r.resourceId,
        resourceType: r.resourceType,
        role: r.role,
      })),
      conflicts: candidate.conflicts,
      status: candidate.status,
      reasoningSummary: `Discovered from ${candidate.sources.join(', ')} with ${candidate.evidence.length} evidence items. Confidence: ${candidate.confidence.level} (${candidate.score}).`,
    };
  }

  public getDiscoveryRun(runId: string): DiscoveryResult | undefined {
    return this.runHistory.get(runId);
  }

  /**
   * Incremental discovery: re-evaluate only candidates touching changed resources
   */
  public async discoverIncremental(
    context: DiscoveryContext,
    changedResourceIds: string[]
  ): Promise<{ reevaluatedCandidates: FeatureCandidate[]; unaffectedCount: number }> {
    const changedSet = new Set(changedResourceIds);
    const affectedCandidates: FeatureCandidate[] = [];
    let unaffectedCount = 0;

    for (const candidate of this.candidateStore.values()) {
      const isAffected = candidate.references.some((r) => changedSet.has(r.resourceId));
      if (isAffected) {
        affectedCandidates.push(candidate);
      } else {
        unaffectedCount++;
      }
    }

    // Re-run discovery context for affected
    if (affectedCandidates.length > 0) {
      await this.discoverFeatures(context);
    }

    return {
      reevaluatedCandidates: affectedCandidates,
      unaffectedCount,
    };
  }

  private async promoteCandidateInternal(candidate: FeatureCandidate): Promise<Feature> {
    const existingFeature = this.registry.getByName(candidate.proposedName);

    // MANUAL FEATURE PROTECTION:
    // If a feature was manually created (origin = MANUAL), automatic discovery MUST NOT replace it or change its origin.
    if (existingFeature) {
      if (existingFeature.origin === FeatureOrigin.MANUAL) {
        // Attach newly discovered evidence to the manual feature without overwriting its origin
        const currentRefs = existingFeature.references || [];
        const newRefs = candidate.references.filter(
          (nr) => !currentRefs.some((cr: any) => cr.resourceId === nr.resourceId)
        );
        existingFeature.references = [...currentRefs, ...newRefs];
        existingFeature.updatedAt = Date.now();

        candidate.status = 'PROMOTED';
        this.emit(FEATURE_CANDIDATE_PROMOTED, {
          candidateId: candidate.candidateId,
          featureId: existingFeature.id,
          origin: existingFeature.origin,
          attachedToExisting: true,
        });

        return existingFeature;
      }
    }

    // Create new discovered feature
    const idSlug = candidate.proposedName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 10);
    const featureId = `feat_${idSlug}_${randomUUID().replace(/-/g, '').slice(0, 8)}`;

    const feature = createDefaultFeature(featureId, candidate.proposedName, candidate.scope, {
      description: candidate.proposedDescription,
      type: candidate.type,
      status: FeatureStatus.ACTIVE,
      origin: FeatureOrigin.DISCOVERED,
      confidence: {
        level: this.mapConfidenceLevel(candidate.confidence.level),
        score: candidate.score,
        reason: candidate.confidence.reasons.join('; '),
      },
      references: candidate.references,
    });

    await this.registry.register(feature);
    candidate.status = 'PROMOTED';

    this.emit(FEATURE_CANDIDATE_PROMOTED, {
      candidateId: candidate.candidateId,
      featureId: feature.id,
      origin: feature.origin,
      attachedToExisting: false,
    });

    return feature;
  }

  private mapConfidenceLevel(level: string): FeatureConfidenceLevel {
    switch (level) {
      case 'VERY_HIGH':
        return FeatureConfidenceLevel.CONFIRMED;
      case 'HIGH':
        return FeatureConfidenceLevel.HIGH;
      case 'MEDIUM':
        return FeatureConfidenceLevel.MEDIUM;
      case 'LOW':
        return FeatureConfidenceLevel.LOW;
      default:
        return FeatureConfidenceLevel.UNKNOWN;
    }
  }

  private emit(event: string, payload: any): void {
    if (this.eventPublisher) {
      try {
        this.eventPublisher.publish(event, payload);
      } catch {
        // Safe dispatching
      }
    }
  }
}
