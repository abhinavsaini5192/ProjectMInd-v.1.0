import * as fs from 'fs';
import * as path from 'path';
import { WorkspaceError } from '../errors';

/**
 * Manages the physical `.projectmind` directory within the workspace.
 */
export class WorkspaceManager {
  private readonly workspaceRoot: string;
  private readonly projectMindDir: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = path.resolve(workspaceRoot);
    this.projectMindDir = path.join(this.workspaceRoot, '.projectmind');
  }

  public get workspacePath(): string {
    return this.workspaceRoot;
  }

  /**
   * Initializes the `.projectmind` directory structure if it doesn't exist.
   */
  public initializeWorkspace(): void {
    try {
      if (!fs.existsSync(this.projectMindDir)) {
        fs.mkdirSync(this.projectMindDir, { recursive: true });
        
        // Create necessary subdirectories
        fs.mkdirSync(path.join(this.projectMindDir, 'SNAPSHOTS'), { recursive: true });
        fs.mkdirSync(path.join(this.projectMindDir, 'CONTEXT'), { recursive: true });
        fs.mkdirSync(path.join(this.projectMindDir, 'CACHE'), { recursive: true });
        
        // Write the default .gitignore
        fs.writeFileSync(path.join(this.projectMindDir, '.gitignore'), 'update.lock\n*.tmp\n');
        
        // Write required metadata files
        const emptyMd = (title: string) => `# ${title}\n\nIntentionally initialized.\n`;
        fs.writeFileSync(path.join(this.projectMindDir, 'STATE.md'), emptyMd('Project State'));
        fs.writeFileSync(path.join(this.projectMindDir, 'ARCHITECTURE.md'), emptyMd('Architecture'));
        fs.writeFileSync(path.join(this.projectMindDir, 'TASKS.md'), emptyMd('Tasks'));
        fs.writeFileSync(path.join(this.projectMindDir, 'CHANGELOG.md'), emptyMd('Changelog'));
        fs.writeFileSync(path.join(this.projectMindDir, 'DECISIONS.md'), emptyMd('Decisions'));
        fs.writeFileSync(path.join(this.projectMindDir, 'MEMORY.json'), JSON.stringify({ version: "1.0", memories: [] }, null, 2));
        fs.writeFileSync(path.join(this.projectMindDir, 'GRAPH.json'), JSON.stringify({ nodes: [], edges: [] }, null, 2));
        fs.writeFileSync(path.join(this.projectMindDir, 'INDEX.json'), JSON.stringify({ files: [] }, null, 2));
      }
    } catch (err: any) {
      throw new WorkspaceError(`Failed to initialize workspace: ${err.message}`);
    }
  }

  /**
   * Validates that the `.projectmind` directory exists and is accessible.
   */
  public validateWorkspace(): boolean {
    return fs.existsSync(this.projectMindDir);
  }

  /**
   * Retrieves the absolute path to the `.projectmind` directory.
   */
  public getProjectMindDir(): string {
    return this.projectMindDir;
  }

  /**
   * Returns a specific file path within the `.projectmind` directory.
   */
  public getFilePath(fileName: string): string {
    return path.join(this.projectMindDir, fileName);
  }
}
