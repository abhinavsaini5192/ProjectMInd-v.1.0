import { describe, it, expect } from 'vitest';
import { EndpointFeatureSource } from '../../../../src/knowledge/features/discovery/sources/EndpointFeatureSource';
import { ModuleFeatureSource } from '../../../../src/knowledge/features/discovery/sources/ModuleFeatureSource';
import { SymbolFeatureSource } from '../../../../src/knowledge/features/discovery/sources/SymbolFeatureSource';
import { DependencyFeatureSource } from '../../../../src/knowledge/features/discovery/sources/DependencyFeatureSource';
import { TestFeatureSource } from '../../../../src/knowledge/features/discovery/sources/TestFeatureSource';
import { ConfigurationFeatureSource } from '../../../../src/knowledge/features/discovery/sources/ConfigurationFeatureSource';
import { DocumentationFeatureSource } from '../../../../src/knowledge/features/discovery/sources/DocumentationFeatureSource';
import { HistoryFeatureSource } from '../../../../src/knowledge/features/discovery/sources/HistoryFeatureSource';
import type { DiscoveryContext } from '../../../../src/knowledge/features/discovery/models/DiscoverySource';

describe('Feature Discovery: Source Evidence Generation', () => {
  const context: DiscoveryContext = {
    workspaceId: 'ws-1',
    repositoryId: 'repo-1',
    endpoints: [
      { method: 'POST', path: '/api/v1/auth/login', handlerSymbolId: 'AuthController.login' },
      { method: 'POST', path: '/api/v1/payments/checkout', handlerSymbolId: 'PaymentController.checkout' },
    ],
    modules: [
      { id: 'mod-1', name: 'auth', path: 'src/auth' },
      { id: 'mod-2', name: 'payments', path: 'src/payments' },
    ],
    symbols: [
      { id: 'sym-1', name: 'AuthService', kind: 'class', filePath: 'src/auth/AuthService.ts' },
      { id: 'sym-2', name: 'PaymentGateway', kind: 'interface', filePath: 'src/payments/PaymentGateway.ts' },
    ],
    dependencies: [
      { sourceId: 'AuthController', targetId: 'AuthService', type: 'CALLS' },
      { sourceId: 'PaymentController', targetId: 'PaymentGateway', type: 'CALLS' },
    ],
    tests: [
      { filePath: 'tests/auth.test.ts', suiteName: 'Authentication Suite' },
      { filePath: 'tests/payments.test.ts', suiteName: 'Payment Processing Suite' },
    ],
    configurations: [
      { key: 'JWT_SECRET', filePath: '.env.example', category: 'Authentication' },
      { key: 'STRIPE_API_KEY', filePath: 'config/payment.json', category: 'Payment' },
    ],
    documentation: [
      {
        filePath: 'README.md',
        sections: [
          { heading: 'Authentication Guide', content: 'Details on user auth flow' },
          { heading: 'Payment Integration', content: 'Details on Stripe processing' },
        ],
      },
    ],
    history: [
      { commitHash: 'c1234567', message: 'Add password reset auth mechanism', changedFiles: ['src/auth/AuthService.ts'], timestamp: 1000 },
      { commitHash: 'c7654321', message: 'Implement Stripe checkout payments', changedFiles: ['src/payments/PaymentGateway.ts'], timestamp: 2000 },
    ],
  };

  it('should extract evidence from EndpointFeatureSource', () => {
    const source = new EndpointFeatureSource();
    const evidence = source.discover(context);
    expect(evidence.length).toBe(2);
    expect(evidence.some(e => e.targetCapability === 'Authentication')).toBe(true);
    expect(evidence.some(e => e.targetCapability === 'Payment Processing')).toBe(true);
  });

  it('should extract evidence from ModuleFeatureSource', () => {
    const source = new ModuleFeatureSource();
    const evidence = source.discover(context);
    expect(evidence.length).toBe(2);
    expect(evidence[0]?.sourceType).toBe('MODULE');
  });

  it('should extract evidence from SymbolFeatureSource', () => {
    const source = new SymbolFeatureSource();
    const evidence = source.discover(context);
    expect(evidence.length).toBe(2);
    expect(evidence[0]?.sourceType).toBe('SYMBOL');
  });

  it('should extract evidence from DependencyFeatureSource', () => {
    const source = new DependencyFeatureSource();
    const evidence = source.discover(context);
    expect(evidence.length).toBeGreaterThanOrEqual(1);
    expect(evidence[0]?.sourceType).toBe('DEPENDENCY');
  });

  it('should extract evidence from TestFeatureSource', () => {
    const source = new TestFeatureSource();
    const evidence = source.discover(context);
    expect(evidence.length).toBe(2);
    expect(evidence[0]?.sourceType).toBe('TEST');
  });

  it('should extract evidence from ConfigurationFeatureSource', () => {
    const source = new ConfigurationFeatureSource();
    const evidence = source.discover(context);
    expect(evidence.length).toBe(2);
    expect(evidence[0]?.sourceType).toBe('CONFIGURATION');
  });

  it('should extract evidence from DocumentationFeatureSource', () => {
    const source = new DocumentationFeatureSource();
    const evidence = source.discover(context);
    expect(evidence.length).toBe(2);
    expect(evidence[0]?.sourceType).toBe('DOCUMENTATION');
  });

  it('should extract evidence from HistoryFeatureSource', () => {
    const source = new HistoryFeatureSource();
    const evidence = source.discover(context);
    expect(evidence.length).toBe(2);
    expect(evidence[0]?.sourceType).toBe('HISTORY');
  });
});
