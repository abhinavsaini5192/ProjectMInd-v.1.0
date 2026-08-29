import { describe, it, expect, beforeEach } from 'vitest';
import { FeatureEngine } from '../../src/knowledge/features/core/FeatureEngine';
import { FeatureRegistry } from '../../src/knowledge/features/core/FeatureRegistry';
import { FeatureExtractor } from '../../src/knowledge/features/core/FeatureExtractor';
import { FeatureResolver } from '../../src/knowledge/features/core/FeatureResolver';
import { FeatureDetector, IFeatureDetectionStrategy } from '../../src/knowledge/features/core/FeatureDetector';
import { FeatureClassifier } from '../../src/knowledge/features/core/FeatureClassifier';
import { FeatureBuilder } from '../../src/knowledge/features/core/FeatureBuilder';
import { FeatureValidator } from '../../src/knowledge/features/validation/FeatureValidator';
import { FeatureOwnershipAnalyzer } from '../../src/knowledge/features/core/FeatureOwnershipAnalyzer';
import { FeatureBoundaryAnalyzer } from '../../src/knowledge/features/core/FeatureBoundaryAnalyzer';
import { KernelEventDispatcher } from '../../src/kernel/core/KernelEventDispatcher';
import { DependencyRegistry } from '../../src/knowledge/dependencies/core/DependencyRegistry';
import { Dependency, DependencyEvidence } from '../../src/knowledge/dependencies/models/Dependency';
import { DependencyCategory } from '../../src/knowledge/dependencies/models/DependencyCategory';
import { FeatureBoundary } from '../../src/knowledge/features/models/FeatureBoundary';
import { FeatureSignal } from '../../src/knowledge/features/models/IFeature';

describe('Feature Intelligence Engine', () => {
  let engine: FeatureEngine;
  let registry: FeatureRegistry;
  let dispatcher: KernelEventDispatcher;
  let resolver: FeatureResolver;
  let detector: FeatureDetector;
  let depRegistry: DependencyRegistry;
  let boundaryAnalyzer: FeatureBoundaryAnalyzer;

  beforeEach(() => {
    registry = new FeatureRegistry();
    detector = new FeatureDetector();
    const classifier = new FeatureClassifier();
    const builder = new FeatureBuilder();
    const extractor = new FeatureExtractor(detector, classifier, builder);
    
    resolver = new FeatureResolver(registry);
    
    depRegistry = new DependencyRegistry();
    const ownership = new FeatureOwnershipAnalyzer(registry);
    boundaryAnalyzer = new FeatureBoundaryAnalyzer(depRegistry, registry, ownership);

    const validator = new FeatureValidator();
    dispatcher = new KernelEventDispatcher();

    engine = new FeatureEngine(registry, extractor, resolver, boundaryAnalyzer, ownership, validator, dispatcher);
  });

  const MockNamingDetector: IFeatureDetectionStrategy = {
    name: 'NamingDetector',
    detect: (symbolIds: string[], _deps: string[]) => {
      const map = new Map<string, FeatureSignal[]>();
      for (const id of symbolIds) {
        if (id.includes('auth')) {
          if (!map.has('Authentication')) map.set('Authentication', []);
          map.get('Authentication')!.push({ type: 'Naming', description: `Matched auth in ${id}`, weight: 0.5 });
        }
        if (id.includes('pay')) {
           if (!map.has('Payment')) map.set('Payment', []);
           map.get('Payment')!.push({ type: 'Naming', description: `Matched pay in ${id}`, weight: 0.5 });
        }
      }
      return map;
    }
  };

  it('should detect and extract features from symbols via detectors', () => {
    detector.registerStrategy(MockNamingDetector);
    const symbols = ['sym_auth_service', 'sym_auth_controller', 'sym_pay_gateway'];
    
    let authCreated = false;
    dispatcher.subscribe('Feature:Created', (f) => {
       if (f.name === 'Authentication') authCreated = true;
    });

    engine.processSemanticGraph(symbols, []);

    expect(authCreated).toBe(true);

    const authFeature = resolver.findFeature('Authentication');
    expect(authFeature).toBeDefined();
    expect(authFeature!.confidence).toBe(1.0); // 0.5 + 0.5 clamped to 1.0
  });

  it('should detect cross-feature architectural bleed via Boundary Analyzer', () => {
    const builder = new FeatureBuilder();
    
    // Build explicit features for boundary testing
    const authFeature = builder.withName('Authentication')
      .withSymbolIds(['sym_auth_service'])
      .withConfidence(1.0)
      .build();
      
    const payFeature = builder.withName('Payment')
      .withSymbolIds(['sym_pay_gateway'])
      .withConfidence(1.0)
      .build();

    registry.register(authFeature);
    registry.register(payFeature);
    
    // Auth illegally calls Payment
    const dep = new Dependency('dep_1', 'sym_auth_service', 'sym_pay_gateway', DependencyCategory.Code, 1.0, [], 1, 'hash');
    depRegistry.registerDependency(dep);

    // Define boundary: Auth is NOT allowed to talk to Payment
    const boundary: FeatureBoundary = {
      featureId: authFeature.id,
      allowedOutboundFeatureIds: [], // Payment not allowed
      allowedInboundFeatureIds: [],
      strictMode: true
    };

    const violations = boundaryAnalyzer.detectBoundaryViolations(boundary);
    expect(violations.length).toBe(1);
    expect(violations[0].type).toBe('FeatureBoundaryBleed');
  });

  it('should prevent duplicate feature names via validator', () => {
     // A detector that tries to emit duplicates is technically caught if we mock the extractor, 
     // but FeatureExtractor groups by map. To test validator we can pass bad features manually.
     const validator = new FeatureValidator();
     const builder = new FeatureBuilder();
     const f1 = builder.withName('Auth').withSymbolIds(['sym1']).build();
     const f2 = builder.withName('Auth').withSymbolIds(['sym2']).build();
     
     expect(() => validator.validate([f1, f2])).toThrowError(/Duplicate Feature Name/);
  });
});
