import { ExecutionObservation } from '../models/ExecutionObservation';
import { ChangeSet } from '../models/ChangeSet';
import { ChangeRecord } from '../models/ChangeRecord';
import { FileChangeAnalyzer } from '../analyzers/FileChangeAnalyzer';
import { SymbolChangeAnalyzer } from '../analyzers/SymbolChangeAnalyzer';
import { DependencyChangeAnalyzer } from '../analyzers/DependencyChangeAnalyzer';
import { ArchitectureChangeAnalyzer } from '../analyzers/ArchitectureChangeAnalyzer';

export class ChangeAnalyzer {
  private fileAnalyzer = new FileChangeAnalyzer();
  private symbolAnalyzer = new SymbolChangeAnalyzer();
  private depAnalyzer = new DependencyChangeAnalyzer();
  private archAnalyzer = new ArchitectureChangeAnalyzer();

  public analyzeChanges(obs: ExecutionObservation): ChangeSet {
    const fileRecords = this.fileAnalyzer.analyze(obs);
    const symbolRecords = this.symbolAnalyzer.analyze(obs);
    const depRecords = this.depAnalyzer.analyze(obs);
    const archReport = this.archAnalyzer.analyze(obs);

    const allRecords: ChangeRecord[] = [
      ...fileRecords,
      ...symbolRecords,
      ...depRecords,
      ...archReport.records
    ];

    return {
      filesAdded: obs.createdFiles || [],
      filesModified: obs.changedFiles || [],
      filesDeleted: obs.deletedFiles || [],
      filesMoved: obs.movedFiles || [],
      symbolsChanged: symbolRecords.map(s => s.resourceId),
      dependenciesChanged: depRecords.map(d => d.resourceId),
      architectureChanged: archReport.violationsDetected,
      configurationChanged: [],
      records: allRecords
    };
  }
}
