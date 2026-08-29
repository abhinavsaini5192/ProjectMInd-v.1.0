import { EvolutionEvent } from '../models/EvolutionEvent';
import { RepositoryTimeline } from '../models/Timelines';

export class EvolutionTimeline {
  private timeline: RepositoryTimeline = {
    events: [],
    lastCommitHash: '',
    totalCommitsAnalyzed: 0
  };

  public appendEvent(event: EvolutionEvent): void {
    this.timeline.events.push(event);
    this.timeline.lastCommitHash = event.commitHash;
    this.timeline.totalCommitsAnalyzed++;
  }

  public getTimeline(): RepositoryTimeline {
    return this.timeline;
  }
}
