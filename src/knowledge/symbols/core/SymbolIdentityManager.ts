import crypto from 'crypto';

export class SymbolIdentityManager {
  /**
   * Generates a stable deterministic ID that survives file moves.
   * Assumes uniqueness within the language + repository + fully qualified scope namespace.
   */
  public generateId(language: string, repository: string, scope: string, name: string): string {
    const payload = `${language}:${repository}:${scope}:${name}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }
}
