import { OutcomeAnalysis } from '../models/OutcomeAnalysis';
import { FeedbackResult } from '../models/FeedbackResult';

export interface BrainFeedbackPayload {
  objectiveAchieved: boolean;
  summary: string;
  unresolvedIssues: string[];
  suggestedAction: 'COMPLETE' | 'REPLAN' | 'RETRY' | 'REQUEST_INPUT';
  sanitizedEvidence: Array<{ type: string; claim: string; confidence: number }>;
}

export class BrainFeedbackAdapter {
  public formatBrainFeedback(feedback: FeedbackResult): BrainFeedbackPayload {
    let suggestedAction: BrainFeedbackPayload['suggestedAction'] = 'COMPLETE';

    if (!feedback.outcome.objectiveSuccess) {
      const rec = feedback.outcome.failureAnalysis?.recommendation;
      if (rec === 'REPLAN') suggestedAction = 'REPLAN';
      else if (rec === 'RETRY') suggestedAction = 'RETRY';
      else if (rec === 'ASK_USER') suggestedAction = 'REQUEST_INPUT';
      else suggestedAction = 'REPLAN';
    }

    // Sanitize any raw terminal text to prevent prompt injection
    const sanitizedEvidence = feedback.promotedLearning.map(l => ({
      type: l.category,
      claim: this.sanitizeText(l.content),
      confidence: l.confidenceScore
    }));

    return {
      objectiveAchieved: feedback.outcome.objectiveSuccess,
      summary: feedback.outcome.goalEvaluation.explanation,
      unresolvedIssues: feedback.unresolvedIssues,
      suggestedAction,
      sanitizedEvidence
    };
  }

  private sanitizeText(raw: string): string {
    // Strip control characters or injection payloads
    return raw.replace(/[\x00-\x1F\x7F]/g, '').trim();
  }
}
