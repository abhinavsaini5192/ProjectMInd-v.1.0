import { ChangeRecord } from './ChangeRecord';

export interface ChangeSet {
  filesAdded: string[];
  filesModified: string[];
  filesDeleted: string[];
  filesMoved: string[];
  symbolsChanged: string[];
  dependenciesChanged: string[];
  architectureChanged: string[];
  configurationChanged: string[];
  records: ChangeRecord[];
}
