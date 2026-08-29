import { UniversalNode } from '../models/UniversalNode';
import crypto from 'crypto';

export class ASTVersionManager {
  private fileHashes: Map<string, string> = new Map();

  public hasFileChanged(filePath: string, newContentHash: string): boolean {
    const existing = this.fileHashes.get(filePath);
    return existing !== newContentHash;
  }

  public updateVersion(filePath: string, contentHash: string): void {
    this.fileHashes.set(filePath, contentHash);
  }

  public generateContentHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

export class ASTCache {
  private cache: Map<string, UniversalNode> = new Map();

  public get(filePath: string): UniversalNode | undefined {
    return this.cache.get(filePath);
  }

  public set(filePath: string, ast: UniversalNode): void {
    this.cache.set(filePath, ast);
  }

  public invalidate(filePath: string): void {
    this.cache.delete(filePath);
  }
}
