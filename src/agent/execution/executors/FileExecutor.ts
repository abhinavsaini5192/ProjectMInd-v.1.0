import { IActionExecutor } from './IActionExecutor';
import { AgentAction } from '../../actions/models/AgentAction';
import { ExecutionContext } from '../models/ExecutionContext';
import { ActionResult } from '../models/ActionResult';
import { ActionType } from '../../actions/models/ActionType';
import { ExecutionState } from '../models/ExecutionState';
import { PathGuard } from '../security/PathGuard';
import { FailureType, ExecutionError } from '../models/FailureTypes';
import * as fs from 'fs';
import * as crypto from 'crypto';

export class FileExecutor implements IActionExecutor {
  
  canExecute(action: AgentAction): boolean {
    return [
      ActionType.CREATE_FILE, 
      ActionType.EDIT_FILE, 
      ActionType.DELETE_FILE, 
      ActionType.RENAME_FILE, 
      ActionType.READ_FILE
    ].includes(action.type);
  }

  validate(action: AgentAction, context: ExecutionContext): void {
    PathGuard.validatePath(action.target, context.repositoryRoot, context.workspaceRoot);
    if (action.type === ActionType.RENAME_FILE && action.parameters.newTarget) {
      PathGuard.validatePath(action.parameters.newTarget, context.repositoryRoot, context.workspaceRoot);
    }
  }

  async execute(action: AgentAction, context: ExecutionContext): Promise<ActionResult> {
    const startedAt = Date.now();
    try {
      this.validate(action, context);
      
      const absolutePath = PathGuard.validatePath(action.target, context.repositoryRoot, context.workspaceRoot);
      let output: Record<string, any> = {};

      if (context.dryRun) {
        return {
          actionId: action.actionId,
          status: ExecutionState.SUCCEEDED,
          startedAt,
          completedAt: Date.now(),
          output: { simulated: true, action: action.type },
          warnings: [],
          errors: [],
          changes: [absolutePath]
        };
      }

      switch (action.type) {
        case ActionType.READ_FILE:
          if (!fs.existsSync(absolutePath)) throw new ExecutionError(FailureType.TARGET_NOT_FOUND, 'File not found');
          output.content = fs.readFileSync(absolutePath, 'utf8');
          break;
          
        case ActionType.CREATE_FILE:
          if (fs.existsSync(absolutePath)) throw new ExecutionError(FailureType.CONFLICT, 'File already exists');
          fs.writeFileSync(absolutePath, action.parameters.content || '', 'utf8');
          break;

        case ActionType.EDIT_FILE:
          if (!fs.existsSync(absolutePath)) throw new ExecutionError(FailureType.TARGET_NOT_FOUND, 'File not found');
          
          if (action.parameters.expectedHash) {
             const currentHash = crypto.createHash('sha256').update(fs.readFileSync(absolutePath, 'utf8')).digest('hex');
             if (currentHash !== action.parameters.expectedHash) {
                throw new ExecutionError(FailureType.CONFLICT, 'File conflict: expectedHash mismatch (optimistic concurrency failed)');
             }
          }
          
          fs.writeFileSync(absolutePath, action.parameters.content, 'utf8');
          break;
          
        case ActionType.DELETE_FILE:
          if (!fs.existsSync(absolutePath)) throw new ExecutionError(FailureType.TARGET_NOT_FOUND, 'File not found');
          fs.unlinkSync(absolutePath);
          break;

        case ActionType.RENAME_FILE:
          if (!fs.existsSync(absolutePath)) throw new ExecutionError(FailureType.TARGET_NOT_FOUND, 'File not found');
          const newPath = PathGuard.validatePath(action.parameters.newTarget, context.repositoryRoot, context.workspaceRoot);
          fs.renameSync(absolutePath, newPath);
          break;
      }

      return {
        actionId: action.actionId,
        status: ExecutionState.SUCCEEDED,
        startedAt,
        completedAt: Date.now(),
        duration: Date.now() - startedAt,
        output,
        warnings: [],
        errors: [],
        changes: [absolutePath]
      };

    } catch (error: any) {
      return {
        actionId: action.actionId,
        status: ExecutionState.FAILED,
        startedAt,
        completedAt: Date.now(),
        output: {},
        warnings: [],
        errors: [error.message],
        changes: []
      };
    }
  }
}
