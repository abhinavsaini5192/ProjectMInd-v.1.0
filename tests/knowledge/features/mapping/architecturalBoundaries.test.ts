import { describe, it, expect, vi } from 'vitest';
import { DIContainer } from '../../../../src/workspace/di/DIContainer';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureMappingRepository } from '../../../../src/knowledge/features/mapping/repository/FeatureMappingRepository';
import { FeatureMappingEngine } from '../../../../src/knowledge/features/mapping/core/FeatureMappingEngine';
import { FeatureMappingAPI } from '../../../../src/knowledge/features/mapping/api/FeatureMappingAPI';
import {
  FeatureMappingTokens,
  registerFeatureMappingServices,
} from '../../../../src/knowledge/features/mapping/di/MappingDISetup';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import {
  FEATURE_MAPPING_STARTED,
  FEATURE_MAPPING_CREATED,
  FEATURE_MAPPING_COMPLETED,
} from '../../../../src/knowledge/features/mapping/events/FeatureMappingEvents';

describe('Feature-to-Code Mapping: Architectural Boundaries & DI', () => {
  it('should register and resolve services through DIContainer properly', () => {
    const container = new DIContainer();
    const registry = new FeatureRegistry();
    const repository = new FeatureMappingRepository();

    registerFeatureMappingServices(container, registry, repository);

    const resolvedRepo = container.resolve<FeatureMappingRepository>(FeatureMappingTokens.Repository);
    expect(resolvedRepo).toBe(repository);

    const resolvedEngine = container.resolve<FeatureMappingEngine>(FeatureMappingTokens.Engine);
    expect(resolvedEngine).toBeInstanceOf(FeatureMappingEngine);

    const api = container.resolve<FeatureMappingAPI>(FeatureMappingTokens.API);
    expect(api).toBeInstanceOf(FeatureMappingAPI);
  });

  it('should dispatch lifecycle events without direct filesystem or scanner dependencies', async () => {
    const registry = new FeatureRegistry();
    const repository = new FeatureMappingRepository();
    const publishedEvents: { event: string; payload: any }[] = [];

    const mockPublisher = {
      publish: vi.fn((event: string, payload: any) => {
        publishedEvents.push({ event, payload });
      }),
    };

    const engine = new FeatureMappingEngine(registry, repository, undefined, mockPublisher);
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });
    registry.registerSync(authFeature);

    await engine.mapFeature('feat_auth', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      symbols: [
        {
          id: 'sym_auth',
          name: 'AuthService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthService.ts',
        },
      ],
    });

    expect(mockPublisher.publish).toHaveBeenCalled();
    const eventNames = publishedEvents.map((e) => e.event);
    expect(eventNames).toContain(FEATURE_MAPPING_STARTED);
    expect(eventNames).toContain(FEATURE_MAPPING_CREATED);
    expect(eventNames).toContain(FEATURE_MAPPING_COMPLETED);
  });
});
