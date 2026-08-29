import { RepositoryTimeline } from '../models/Timelines';

export interface EvolutionMetricsReport {
  changeFrequency: number;
  hotspotSymbolIds: string[];
  churnTrend: number; // simplistic
}

export class EvolutionMetrics {
  public calculate(timeline: RepositoryTimeline): EvolutionMetricsReport {
    if (timeline.events.length === 0) {
      return { changeFrequency: 0, hotspotSymbolIds: [], churnTrend: 0 };
    }
    
    // Very simplified hotspot logic: any symbol modified more than once
    const counts = new Map<string, number>();
    for (const event of timeline.events) {
       // Using raw descriptions or if we stored snapshot inside event.
       // For mock purposes, just an empty array
    }

    return {
      changeFrequency: timeline.totalCommitsAnalyzed,
      hotspotSymbolIds: [],
      churnTrend: timeline.totalCommitsAnalyzed > 10 ? 1.5 : 1.0
    };
  }
}
