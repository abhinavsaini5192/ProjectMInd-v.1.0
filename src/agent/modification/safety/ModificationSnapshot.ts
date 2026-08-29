export interface ModificationSnapshot {
  changeId: string;
  file: string;
  content: string; // The full content of the file before modification
  hash: string;
  timestamp: number;
}
