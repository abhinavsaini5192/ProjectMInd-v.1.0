import { describe, it, expect } from 'vitest';
import { ImpactTestHelper } from './ImpactTestHelper.js';
import { MappingImpactSource } from '../../../../src/knowledge/features/impact/sources/MappingImpactSource.js';
import { DependencyImpactSource } from '../../../../src/knowledge/features/impact/sources/DependencyImpactSource.js';
import { BehaviorImpactSource } from '../../../../src/knowledge/features/impact/sources/BehaviorImpactSource.js';
import { EndpointImpactSource } from '../../../../src/knowledge/features/impact/sources/EndpointImpactSource.js';
import { DataImpactSource } from '../../../../src/knowledge/features/impact/sources/DataImpactSource.js';
import { IntegrationImpactSource } from '../../../../src/knowledge/features/impact/sources/IntegrationImpactSource.js';
import { TestImpactSource } from '../../../../src/knowledge/features/impact/sources/TestImpactSource.js';
import { ArchitectureImpactSource } from '../../../../src/knowledge/features/impact/sources/ArchitectureImpactSource.js';

describe('Phase 6.7 - Impact Sources', () => {
  it('MappingImpactSource should detect direct feature impact from mapped resources', async () => {
    const mapping = ImpactTestHelper.createMapping('feat_auth', 'AuthService.login', 'SYMBOL');
    const change = ImpactTestHelper.createChange('AuthService.login', 'SYMBOL');
    const context = ImpactTestHelper.createContext({
      changes: [change],
      mappings: [mapping],
    });

    const source = new MappingImpactSource();
    const candidates = await source.detectImpacts(context);

    expect(candidates.length).toBeGreaterThanOrEqual(1);
    const c = candidates.find((cand) => cand.targetFeatureId === 'feat_auth');
    expect(c).toBeDefined();
    expect(c!.direct).toBe(true);
    expect(c!.distance).toBe(0);
    expect(c!.impactType).toBe('DIRECT');
  });

  it('DependencyImpactSource should detect downstream dependent feature impact', async () => {
    const mapping = ImpactTestHelper.createMapping('feat_auth', 'AuthService.login', 'SYMBOL');
    const rel = ImpactTestHelper.createRelationship('feat_checkout', 'feat_auth', 'DEPENDS_ON');
    const change = ImpactTestHelper.createChange('AuthService.login', 'SYMBOL');
    const context = ImpactTestHelper.createContext({
      changes: [change],
      mappings: [mapping],
      relationships: [rel],
    });

    const source = new DependencyImpactSource();
    const candidates = await source.detectImpacts(context);

    expect(candidates.length).toBeGreaterThanOrEqual(1);
    const c = candidates.find((cand) => cand.targetFeatureId === 'feat_checkout');
    expect(c).toBeDefined();
    expect(c!.direct).toBe(false);
    expect(c!.distance).toBe(1);
    expect(c!.impactType).toBe('DEPENDENCY');
  });

  it('BehaviorImpactSource should trace flow nodes and boundary crossings', async () => {
    const flow = ImpactTestHelper.createFlow('flow_login', 'feat_auth', 'Login Flow', [
      { nodeId: 'n1', resourceId: 'AuthService.login', label: 'AuthService.login', stepType: 'INVOCATION', confidence: 0.95 },
      { nodeId: 'n2', resourceId: 'CheckoutAuthStep', label: 'CheckoutAuthStep', stepType: 'DELEGATION', metadata: { targetFeatureId: 'feat_checkout' }, confidence: 0.9 },
    ]);
    const behavior = ImpactTestHelper.createBehavior('feat_auth', [flow]);
    const change = ImpactTestHelper.createChange('AuthService.login', 'SYMBOL');
    const context = ImpactTestHelper.createContext({
      changes: [change],
      behaviors: [behavior],
    });

    const source = new BehaviorImpactSource();
    const candidates = await source.detectImpacts(context);

    expect(candidates.length).toBeGreaterThanOrEqual(2);
    expect(candidates.some((c) => c.targetFeatureId === 'feat_auth' && c.direct)).toBe(true);
    expect(candidates.some((c) => c.targetFeatureId === 'feat_checkout' && !c.direct)).toBe(true);
  });

  it('EndpointImpactSource should detect API impacts on owning features and consumers', async () => {
    const mapping = ImpactTestHelper.createMapping('feat_auth', 'POST /api/v1/login', 'ENDPOINT');
    const rel = ImpactTestHelper.createRelationship('feat_mobile', 'feat_auth', 'CONSUMES');
    const change = ImpactTestHelper.createChange('POST /api/v1/login', 'ENDPOINT', 'API_CHANGED', {
      name: 'POST /api/v1/login',
    });
    const context = ImpactTestHelper.createContext({
      changes: [change],
      mappings: [mapping],
      relationships: [rel],
    });

    const source = new EndpointImpactSource();
    const candidates = await source.detectImpacts(context);

    expect(candidates.length).toBeGreaterThanOrEqual(2);
    expect(candidates.some((c) => c.targetFeatureId === 'feat_auth' && c.impactType === 'API')).toBe(true);
    expect(candidates.some((c) => c.targetFeatureId === 'feat_mobile' && c.impactType === 'API')).toBe(true);
  });

  it('DataImpactSource should trace specific entity schema changes and not generic databases', async () => {
    const mappingUser = ImpactTestHelper.createMapping('feat_user', 'users_table', 'DATABASE_ENTITY', 'STORAGE');
    const mappingGeneric = ImpactTestHelper.createMapping('feat_billing', 'sqlite_db', 'DATABASE', 'STORAGE');

    const change = ImpactTestHelper.createChange('users_table', 'DATABASE_ENTITY', 'DATA_SCHEMA_CHANGED', {
      name: 'users_table',
    });
    const context = ImpactTestHelper.createContext({
      changes: [change],
      mappings: [mappingUser, mappingGeneric],
    });

    const source = new DataImpactSource();
    const candidates = await source.detectImpacts(context);

    expect(candidates.some((c) => c.targetFeatureId === 'feat_user')).toBe(true);
    // Billing should NOT be marked because it only shares generic database
    expect(candidates.some((c) => c.targetFeatureId === 'feat_billing')).toBe(false);
  });

  it('IntegrationImpactSource should trace external integration adapters and consumers', async () => {
    const mapping = ImpactTestHelper.createMapping('feat_payment', 'StripePaymentAdapter.ts', 'FILE');
    const rel = ImpactTestHelper.createRelationship('feat_checkout', 'feat_payment', 'INTEGRATES_WITH');
    const change = ImpactTestHelper.createChange('StripePaymentAdapter.ts', 'FILE', 'MODIFIED', {
      name: 'StripePaymentAdapter',
      filePath: 'src/adapters/StripePaymentAdapter.ts',
    });
    const context = ImpactTestHelper.createContext({
      changes: [change],
      mappings: [mapping],
      relationships: [rel],
    });

    const source = new IntegrationImpactSource();
    const candidates = await source.detectImpacts(context);

    expect(candidates.some((c) => c.targetFeatureId === 'feat_payment' && c.impactType === 'INTEGRATION')).toBe(true);
    expect(candidates.some((c) => c.targetFeatureId === 'feat_checkout' && c.impactType === 'INTEGRATION')).toBe(true);
  });

  it('TestImpactSource should classify test modifications as VERIFICATION impact', async () => {
    const mapping = ImpactTestHelper.createMapping('feat_auth', 'AuthService.test.ts', 'TEST');
    const change = ImpactTestHelper.createChange('AuthService.test.ts', 'TEST', 'MODIFIED', {
      filePath: 'tests/services/AuthService.test.ts',
    });
    const context = ImpactTestHelper.createContext({
      changes: [change],
      mappings: [mapping],
    });

    const source = new TestImpactSource();
    const candidates = await source.detectImpacts(context);

    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates[0]!.impactType).toBe('VERIFICATION');
  });

  it('ArchitectureImpactSource should detect architectural layer impact for platform changes', async () => {
    const feature = ImpactTestHelper.createFeature('feat_app', 'ApplicationFeature', { type: 'USER_FACING' });
    const change = ImpactTestHelper.createChange('KernelCore.ts', 'FILE', 'MODIFIED', {
      filePath: 'src/kernel/KernelCore.ts',
    });
    const context = ImpactTestHelper.createContext({
      changes: [change],
      features: [feature],
    });

    const source = new ArchitectureImpactSource();
    const candidates = await source.detectImpacts(context);

    expect(candidates.some((c) => c.targetFeatureId === 'feat_app' && c.impactType === 'ARCHITECTURAL')).toBe(true);
  });
});
