import * as fs from 'fs';
import * as path from 'path';
import { ProjectMindError } from '../../errors';

export class DatasetManager {
  private baseDir: string;
  private dirs: Record<string, string>;

  constructor(workspacePath: string) {
    this.baseDir = path.join(workspacePath, 'research', 'datasets');
    this.dirs = {
      raw: path.join(this.baseDir, 'raw'),
      processed: path.join(this.baseDir, 'processed'),
      benchmarks: path.join(this.baseDir, 'benchmarks'),
      exports: path.join(this.baseDir, 'exports'),
      archive: path.join(this.baseDir, 'archive')
    };
    this.initializeDirectories();
  }

  private initializeDirectories(): void {
    for (const dir of Object.values(this.dirs)) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  public getDirectory(type: 'raw' | 'processed' | 'benchmarks' | 'exports' | 'archive'): string {
    return this.dirs[type];
  }

  public writeManifest(exportName: string, manifest: any): void {
    const manifestPath = path.join(this.dirs.exports, exportName, 'manifest.json');
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  }
}
