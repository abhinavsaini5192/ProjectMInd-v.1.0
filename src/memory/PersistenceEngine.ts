import * as fs from 'fs';
import * as path from 'path';
import { ProjectMindError } from '../errors';

/**
 * Handles atomic file operations to prevent corruption.
 */
export class PersistenceEngine {
  private baseDir: string;

  constructor(workspacePath: string) {
    this.baseDir = path.join(workspacePath, '.projectmind');
    this.initializeDirectories();
  }

  private initializeDirectories(): void {
    const dirs = ['graph', 'history', 'snapshots', 'schemas'];
    for (const dir of dirs) {
      const fullPath = path.join(this.baseDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  /**
   * Safely writes JSON data using a temporary file to guarantee atomic swaps.
   */
  public async writeAtomicJson(relativePath: string, data: any): Promise<void> {
    const targetPath = path.join(this.baseDir, relativePath);
    const tempPath = `${targetPath}.tmp`;
    
    try {
      // Create parent directory if missing
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(tempPath, jsonString, 'utf-8');
      
      // Atomic rename
      fs.renameSync(tempPath, targetPath);
    } catch (err: any) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw new ProjectMindError(`Atomic write failed for ${relativePath}: ${err.message}`, 'ATOMIC_WRITE_FAILED');
    }
  }

  /**
   * Reads JSON safely. Returns null if file does not exist.
   */
  public async readJson<T>(relativePath: string): Promise<T | null> {
    const targetPath = path.join(this.baseDir, relativePath);
    if (!fs.existsSync(targetPath)) return null;
    
    try {
      const content = fs.readFileSync(targetPath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (err: any) {
      throw new ProjectMindError(`Failed to read JSON at ${relativePath}: ${err.message}`, 'JSON_READ_FAILED');
    }
  }

  /**
   * Appends to a JSONL (JSON Lines) file. Great for history.
   */
  public async appendJsonLines(relativePath: string, data: any): Promise<void> {
    const targetPath = path.join(this.baseDir, relativePath);
    try {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      const line = JSON.stringify(data) + '\n';
      fs.appendFileSync(targetPath, line, 'utf-8');
    } catch (err: any) {
      throw new ProjectMindError(`Failed to append to ${relativePath}: ${err.message}`, 'JSONL_APPEND_FAILED');
    }
  }
}
