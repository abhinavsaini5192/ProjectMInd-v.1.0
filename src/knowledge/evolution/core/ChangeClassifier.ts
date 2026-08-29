import { CommitSnapshot } from '../models/CommitSnapshot';
import { ChangeClassification } from '../types/EvolutionTypes';

export class ChangeClassifier {
  public classify(snapshot: CommitSnapshot): ChangeClassification[] {
    const labels = new Set<ChangeClassification>();
    const msg = snapshot.message.toLowerCase();

    // Semantic Commit matching
    if (msg.includes('feat') || msg.includes('add') || snapshot.addedFeatureIds.length > 0) {
      labels.add(ChangeClassification.Feature);
    }
    if (msg.includes('fix') || msg.includes('bug')) {
      labels.add(ChangeClassification.BugFix);
    }
    if (msg.includes('refactor') || msg.includes('clean')) {
      labels.add(ChangeClassification.Refactor);
    }
    if (msg.includes('doc')) {
      labels.add(ChangeClassification.Documentation);
    }
    if (msg.includes('config') || snapshot.changedFiles.some(f => f.includes('config') || f.includes('.json'))) {
      labels.add(ChangeClassification.Configuration);
    }
    if (msg.includes('dep') || msg.includes('bump')) {
      labels.add(ChangeClassification.Dependency);
    }
    if (msg.includes('test') || snapshot.changedFiles.some(f => f.includes('test'))) {
      labels.add(ChangeClassification.Test);
    }
    if (msg.includes('sec') || msg.includes('vuln')) {
      labels.add(ChangeClassification.Security);
    }
    if (msg.includes('perf') || msg.includes('opt')) {
      labels.add(ChangeClassification.Performance);
    }
    if (msg.includes('arch') || msg.includes('layer')) {
      labels.add(ChangeClassification.Architecture);
    }

    if (labels.size === 0) {
      labels.add(ChangeClassification.Unknown);
    }

    return Array.from(labels);
  }
}
