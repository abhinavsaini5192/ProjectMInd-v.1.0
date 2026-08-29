import * as path from 'path';
import { FailureType, ExecutionError } from '../models/FailureTypes';

export class PathGuard {
  
  public static validatePath(target: string, repositoryRoot: string, workspaceRoot: string): string {
    const normalizedTarget = path.normalize(target);
    const absoluteTarget = path.resolve(repositoryRoot, normalizedTarget);
    
    // Prevent directory traversal escapes (../../)
    const relativeToRepo = path.relative(repositoryRoot, absoluteTarget);
    if (relativeToRepo.startsWith('..') || path.isAbsolute(relativeToRepo)) {
       throw new ExecutionError(FailureType.PATH_TRAVERSAL, `Path escape detected: ${target} is outside repository root ${repositoryRoot}`);
    }

    // Double check workspace boundaries just in case repo was misconfigured
    const relativeToWorkspace = path.relative(workspaceRoot, absoluteTarget);
    if (relativeToWorkspace.startsWith('..') || path.isAbsolute(relativeToWorkspace)) {
       throw new ExecutionError(FailureType.PATH_TRAVERSAL, `Path escape detected: ${target} is outside workspace root ${workspaceRoot}`);
    }

    // Windows absolute path edge cases (e.g., C:/Windows)
    if (target.match(/^[a-zA-Z]:[\\/]/) || target.startsWith('/etc/') || target.startsWith('/var/')) {
       throw new ExecutionError(FailureType.PATH_TRAVERSAL, `Absolute system paths are strictly forbidden: ${target}`);
    }

    return absoluteTarget;
  }
}
