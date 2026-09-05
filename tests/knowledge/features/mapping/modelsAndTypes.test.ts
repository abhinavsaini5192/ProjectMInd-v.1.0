import { describe, it, expect } from 'vitest';
import { VALID_MAPPING_RESOURCE_TYPES } from '../../../../src/knowledge/features/mapping/models/MappingResourceType';
import { VALID_MAPPING_ROLES } from '../../../../src/knowledge/features/mapping/models/MappingRole';
import { scoreToMappingConfidenceLevel } from '../../../../src/knowledge/features/mapping/models/MappingConfidence';
import type { FeatureResourceMapping } from '../../../../src/knowledge/features/mapping/models/FeatureResourceMapping';

describe('Feature-to-Code Mapping: Models & Types', () => {
  it('should define all required resource types including DATABASE_ENTITY and DOCUMENTATION', () => {
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('FILE');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('SYMBOL');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('MODULE');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('PACKAGE');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('ENDPOINT');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('DEPENDENCY');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('CONFIGURATION');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('DATABASE');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('DATABASE_ENTITY');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('TEST');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('UI_COMPONENT');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('COMMAND');
    expect(VALID_MAPPING_RESOURCE_TYPES).toContain('DOCUMENTATION');
  });

  it('should define all required mapping roles', () => {
    expect(VALID_MAPPING_ROLES).toContain('ENTRY_POINT');
    expect(VALID_MAPPING_ROLES).toContain('IMPLEMENTATION');
    expect(VALID_MAPPING_ROLES).toContain('SUPPORT');
    expect(VALID_MAPPING_ROLES).toContain('DEPENDENCY');
    expect(VALID_MAPPING_ROLES).toContain('CONFIGURATION');
    expect(VALID_MAPPING_ROLES).toContain('STORAGE');
    expect(VALID_MAPPING_ROLES).toContain('TEST');
    expect(VALID_MAPPING_ROLES).toContain('VERIFICATION');
    expect(VALID_MAPPING_ROLES).toContain('API');
    expect(VALID_MAPPING_ROLES).toContain('UI');
    expect(VALID_MAPPING_ROLES).toContain('COMMAND');
    expect(VALID_MAPPING_ROLES).toContain('DOCUMENTATION');
    expect(VALID_MAPPING_ROLES).toContain('INTEGRATION');
    expect(VALID_MAPPING_ROLES).toContain('ORCHESTRATION');
    expect(VALID_MAPPING_ROLES).toContain('INFRASTRUCTURE');
  });

  it('should correctly convert numeric score to confidence level', () => {
    expect(scoreToMappingConfidenceLevel(0.95)).toBe('VERY_HIGH');
    expect(scoreToMappingConfidenceLevel(0.85)).toBe('VERY_HIGH');
    expect(scoreToMappingConfidenceLevel(0.75)).toBe('HIGH');
    expect(scoreToMappingConfidenceLevel(0.55)).toBe('MEDIUM');
    expect(scoreToMappingConfidenceLevel(0.25)).toBe('LOW');
    expect(scoreToMappingConfidenceLevel(0.10)).toBe('VERY_LOW');
  });

  it('should construct valid FeatureResourceMapping instance with complete provenance', () => {
    const mapping: FeatureResourceMapping = {
      mappingId: 'map_001',
      featureId: 'feat_auth',
      resourceId: 'src/auth/AuthService.ts',
      resourceType: 'FILE',
      role: 'IMPLEMENTATION',
      confidence: { level: 'VERY_HIGH', score: 0.95, reasons: ['Direct implementation'] },
      score: 0.95,
      evidence: [
        {
          evidenceId: 'ev_1',
          sourceType: 'FILE',
          sourceId: 'src/auth/AuthService.ts',
          evidenceType: 'FILE_CONTAINS_FEATURE_SYMBOL',
          description: 'Contains AuthService',
          strength: 0.9,
          confidence: 0.95,
          timestamp: 1000,
        },
      ],
      source: 'DISCOVERED',
      scope: { workspaceId: 'ws_1', repositoryId: 'repo_1' },
      createdAt: 1000,
      updatedAt: 1000,
      knowledgeVersion: '1.0.0',
      mappingVersion: 1,
      active: true,
    };

    expect(mapping.mappingId).toBe('map_001');
    expect(mapping.active).toBe(true);
    expect(mapping.evidence.length).toBe(1);
  });
});
