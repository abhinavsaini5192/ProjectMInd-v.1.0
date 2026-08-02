import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface FileMetadata {
  sizeBytes: number;
  hash: string;
  lastModifiedMs: number;
}

/**
 * Extracts basic filesystem metadata deterministically.
 */
export class MetadataExtractor {
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  /**
   * Retrieves metadata for a file. Returns null if file is deleted.
   */
  public getMetadata(relativeFilePath: string): FileMetadata | null {
    const absolutePath = path.join(this.workspacePath, relativeFilePath);
    
    if (!fs.existsSync(absolutePath)) {
      return null;
    }

    const stat = fs.statSync(absolutePath);
    const content = fs.readFileSync(absolutePath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    return {
      sizeBytes: stat.size,
      hash,
      lastModifiedMs: stat.mtimeMs
    };
  }
}
