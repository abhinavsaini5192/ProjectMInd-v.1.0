import { execSync } from 'child_process';
import { ChangeObject, DiffManifest } from './models/ChangeObject';
import { ProjectMindError } from '../errors';

/**
 * Extracts changes from Git deterministically.
 */
export class DiffEngine {
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  /**
   * Generates a DiffManifest comparing a previous commit to HEAD.
   * If commitHashFrom is empty, it acts as an initial full-tree diff.
   */
  public generateDiff(commitHashFrom: string, commitHashTo: string = 'HEAD'): DiffManifest {
    try {
      const files: ChangeObject[] = [];
      
      // If no base commit, simulate adding all tracked files
      if (!commitHashFrom) {
        const output = execSync('git ls-tree -r HEAD --name-only', { cwd: this.workspacePath, encoding: 'utf-8' });
        const lines = output.split('\n').filter(Boolean);
        for (const line of lines) {
          files.push({ status: 'added', path: line });
        }
      } else {
        // name-status gives format: M file.ts, A new.ts, D old.ts, R100 old.ts new.ts
        const command = `git diff --name-status ${commitHashFrom} ${commitHashTo}`;
        const output = execSync(command, { cwd: this.workspacePath, encoding: 'utf-8' });
        
        const lines = output.split('\n').filter(Boolean);
        for (const line of lines) {
          const parts = line.split('\t');
          const statusChar = parts[0][0]; // A, M, D, R
          
          if (statusChar === 'A') {
            files.push({ status: 'added', path: parts[1] });
          } else if (statusChar === 'M') {
            files.push({ status: 'modified', path: parts[1] });
          } else if (statusChar === 'D') {
            files.push({ status: 'deleted', path: parts[1] });
          } else if (statusChar === 'R') {
            files.push({ status: 'renamed', previousPath: parts[1], path: parts[2] });
          }
        }
      }

      return {
        commitHashFrom,
        commitHashTo,
        files
      };
    } catch (err: any) {
      throw new ProjectMindError(`Failed to generate diff: ${err.message}`, 'DIFF_GENERATION_FAILED');
    }
  }
}
