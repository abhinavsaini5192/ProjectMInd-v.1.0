/**
 * Normalized representation of a file change derived from Git.
 */
export interface ChangeObject {
  /**
   * The status of the file in the diff.
   */
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  
  /**
   * The current absolute or relative path to the file.
   */
  path: string;
  
  /**
   * The previous path if the file was renamed.
   */
  previousPath?: string;
  
  /**
   * The unified diff text chunks (optional, mostly used for fallbacks/understanding layer).
   */
  rawDiff?: string;
}

/**
 * Manifest wrapping all changes between two commits.
 */
export interface DiffManifest {
  commitHashFrom: string;
  commitHashTo: string;
  files: ChangeObject[];
}
