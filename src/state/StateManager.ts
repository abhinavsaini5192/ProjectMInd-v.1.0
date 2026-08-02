import * as fs from 'fs';
import { WorkspaceManager } from '../workspace/WorkspaceManager';
import { ProjectMindError } from '../errors';

export interface ProjectState {
  schema_version: "1.0.0";
  project_name: string;
  created_at: string;
  last_update_timestamp: string;
  last_commit_hash: string;
  total_commits_processed: number;
}

export class StateManager {
  private workspace: WorkspaceManager;
  private stateFile: string;
  private currentState: ProjectState | null = null;

  constructor(workspace: WorkspaceManager) {
    this.workspace = workspace;
    this.stateFile = this.workspace.getFilePath('state.json');
  }

  /**
   * Initializes the state. If no state exists, creates a default one.
   */
  public initializeState(projectName: string = 'unknown'): void {
    if (!fs.existsSync(this.stateFile)) {
      this.currentState = {
        schema_version: "1.0.0",
        project_name: projectName,
        created_at: new Date().toISOString(),
        last_update_timestamp: new Date().toISOString(),
        last_commit_hash: '',
        total_commits_processed: 0
      };
      this.saveState();
    } else {
      this.loadState();
    }
  }

  /**
   * Loads state from disk.
   */
  public loadState(): void {
    try {
      const data = fs.readFileSync(this.stateFile, 'utf-8');
      this.currentState = JSON.parse(data) as ProjectState;
    } catch (err: any) {
      throw new ProjectMindError(`Failed to load state: ${err.message}`, 'STATE_LOAD_FAILED');
    }
  }

  /**
   * Saves current state to disk automatically using an atomic write pattern.
   */
  public saveState(): void {
    if (!this.currentState) {
      throw new ProjectMindError('Cannot save empty state.', 'STATE_SAVE_FAILED');
    }
    this.currentState.last_update_timestamp = new Date().toISOString();
    try {
      const tmpFile = `${this.stateFile}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.currentState, null, 2), 'utf-8');
      fs.renameSync(tmpFile, this.stateFile);
    } catch (err: any) {
      throw new ProjectMindError(`Failed to save state: ${err.message}`, 'STATE_SAVE_FAILED');
    }
  }

  /**
   * Updates state properties.
   */
  public updateState(updates: Partial<ProjectState>): void {
    if (!this.currentState) {
      throw new ProjectMindError('State is not initialized.', 'STATE_UPDATE_FAILED');
    }
    this.currentState = { ...this.currentState, ...updates };
  }

  /**
   * Retrieves the current state object.
   */
  public getState(): ProjectState | null {
    return this.currentState;
  }
}
