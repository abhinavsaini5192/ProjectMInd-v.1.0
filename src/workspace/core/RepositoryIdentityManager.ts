import { randomUUID } from 'crypto';
import { ValidationError } from '../errors';

export class RepositoryIdentityManager {
  generateId(): string {
    return randomUUID();
  }

  validateId(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  assertValidId(id: string): void {
    if (!this.validateId(id)) {
      throw new ValidationError(`Invalid repository UUID: ${id}`);
    }
  }
}

export const IRepositoryIdentityManagerToken = Symbol('RepositoryIdentityManager');
