import { InformationGap } from '../models/InformationGap';

export class FeedbackAdapter {
  public analyzeFeedbackForGaps(feedback: any): InformationGap[] {
    const gaps: InformationGap[] = [];

    if (feedback.unresolvedIssues && feedback.unresolvedIssues.length > 0) {
      for (const issue of feedback.unresolvedIssues) {
        gaps.push({
          gapId: `gap_fb_${Date.now()}`,
          subtaskId: feedback.subtaskId || 'current_subtask',
          description: `Execution failure encountered: ${issue}`,
          severity: 'HIGH',
          blocking: true,
          confidence: 0.9,
          requiredEvidence: 'Targeted configuration or error log context',
          resolved: false
        });
      }
    }

    return gaps;
  }
}
