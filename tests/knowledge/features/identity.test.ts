import { describe, it, expect } from 'vitest';
import { FeatureIdentityManager } from '../../../src/knowledge/features/core/FeatureIdentityManager';
import { isValidFeatureId } from '../../../src/knowledge/features/models/FeatureId';
import { InvalidFeatureError } from '../../../src/knowledge/features/errors/InvalidFeatureError';

describe('Feature Identity & Stability', () => {
  const identityManager = new FeatureIdentityManager();

  it('should generate valid stable feature IDs', () => {
    const id = identityManager.createFeatureId('Authentication', 'repo-1');
    expect(id).toMatch(/^feat_/);
    expect(isValidFeatureId(id)).toBe(true);
    expect(identityManager.isValidFeatureId(id)).toBe(true);
  });

  it('should validate valid feature IDs and throw for invalid ones', () => {
    expect(() => identityManager.validateFeatureId('feat_auth_12345678')).not.toThrow();
    expect(() => identityManager.validateFeatureId('invalid-id')).toThrow(InvalidFeatureError);
    expect(() => identityManager.validateFeatureId('src/auth/login.ts')).toThrow(InvalidFeatureError);
  });

  it('should ensure uniqueness when ID conflicts exist', () => {
    const existing = new Set(['feat_auth_service']);
    const uniqueId = identityManager.ensureUniqueFeatureId('feat_auth_service', existing);
    expect(uniqueId).toBe('feat_auth_service_1');
  });
});
