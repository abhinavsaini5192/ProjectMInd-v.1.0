import { describe, it, expect } from 'vitest';
import { ImpactTestHelper } from './ImpactTestHelper.js';
import { FeatureImpactEngine } from '../../../../src/knowledge/features/impact/core/FeatureImpactEngine.js';
import { FeatureImpactCoordinator } from '../../../../src/knowledge/features/impact/core/FeatureImpactCoordinator.js';
import { FeatureImpactRepository } from '../../../../src/knowledge/features/impact/repository/FeatureImpactRepository.js';

describe('Phase 6.7 - Incremental Impact', () => {
  it('should recompute only affected features in incremental mode without touching unrelated knowledge', async () => {
    const repo = new FeatureImpactRepository();

    const featAuth = ImpactTestHelper.createFeature('feat_auth', 'Authentication');
    const featPayment = ImpactTestHelper.createFeature('feat_payment', 'Payment');

    const mapAuth = ImpactTestHelper.createMapping('feat_auth', 'PasswordResetService', 'SYMBOL');
    const mapPayment = ImpactTestHelper.createMapping('feat_payment', 'PaymentGateway', 'SYMBOL');

    const coordinator = new FeatureImpactCoordinator({
      features: [featAuth, featPayment],
      mappings: [mapAuth, mapPayment],
    });

    const engine = new FeatureImpactEngine(repo, { coordinator });

    // Initial full run with Payment
    const changePayment = ImpactTestHelper.createChange('PaymentGateway', 'SYMBOL');
    const fullResult = await engine.analyzeChange(changePayment, { repositoryId: 'repo_test' });

    expect(fullResult.featureImpacts.some((f) => f.targetFeatureId === 'feat_payment')).toBe(true);

    // Incremental run touching only PasswordResetService in Authentication
    const changeAuth = ImpactTestHelper.createChange('PasswordResetService', 'SYMBOL');
    const incrResult = await engine.analyzeIncremental([changeAuth], { repositoryId: 'repo_test' });

    // Only feat_auth should be in incremental featureImpacts
    expect(incrResult.featureImpacts.some((f) => f.targetFeatureId === 'feat_auth')).toBe(true);
    expect(incrResult.featureImpacts.some((f) => f.targetFeatureId === 'feat_payment')).toBe(false);
  });
});
