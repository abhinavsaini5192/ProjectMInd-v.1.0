import { describe, it, expect } from 'vitest';
import { RepositoryIdentityManager } from '../../src/workspace/core/RepositoryIdentityManager';
import { ValidationError } from '../../src/workspace/errors';

describe('RepositoryIdentityManager', () => {
  it('should generate valid UUIDs', () => {
    const manager = new RepositoryIdentityManager();
    const id = manager.generateId();
    expect(manager.validateId(id)).toBe(true);
  });

  it('should validate correct UUIDs', () => {
    const manager = new RepositoryIdentityManager();
    expect(manager.validateId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    const manager = new RepositoryIdentityManager();
    expect(manager.validateId('not-a-uuid')).toBe(false);
  });

  it('should assert and throw on invalid UUID', () => {
    const manager = new RepositoryIdentityManager();
    expect(() => manager.assertValidId('invalid')).toThrowError(ValidationError);
  });
});
