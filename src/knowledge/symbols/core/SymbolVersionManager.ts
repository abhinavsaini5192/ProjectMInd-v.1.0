import crypto from 'crypto';

export class SymbolVersionManager {
  /**
   * Generates a hash representing the structural state of the symbol.
   */
  public generateHash(contentOrBody: string): string {
    return crypto.createHash('sha256').update(contentOrBody).digest('hex');
  }

  public isModified(oldHash: string, newHash: string): boolean {
    return oldHash !== newHash;
  }
}
