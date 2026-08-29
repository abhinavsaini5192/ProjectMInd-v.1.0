import * as path from 'path';

export class FilesystemValidator {
  static isValidPath(p: string): boolean {
    return typeof p === 'string' && p.trim().length > 0;
  }

  static isSafeSubpath(basePath: string, subPath: string): boolean {
    const resolvedBase = path.resolve(basePath);
    const resolvedSub = path.resolve(basePath, subPath);
    return resolvedSub.startsWith(resolvedBase);
  }
}
