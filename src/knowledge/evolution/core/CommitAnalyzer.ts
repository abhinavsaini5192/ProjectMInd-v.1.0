import { CommitSnapshot } from '../models/CommitSnapshot';
import { EvolutionEvent } from '../models/EvolutionEvent';
import { ChangeClassifier } from './ChangeClassifier';
import { ChangeImpactAnalyzer } from './ChangeImpactAnalyzer';
import crypto from 'crypto';

export class CommitAnalyzer {
  constructor(
    private classifier: ChangeClassifier,
    private impactAnalyzer: ChangeImpactAnalyzer
  ) {}

  public analyze(snapshot: CommitSnapshot): EvolutionEvent {
    const classifications = this.classifier.classify(snapshot);
    const impact = this.impactAnalyzer.analyze(snapshot);
    
    const id = crypto.createHash('sha256').update(snapshot.commitHash + snapshot.timestamp.toString()).digest('hex');

    return {
      id,
      commitHash: snapshot.commitHash,
      timestamp: snapshot.timestamp,
      classifications,
      impact,
      description: snapshot.message
    };
  }
}
