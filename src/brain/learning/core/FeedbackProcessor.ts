import { Feedback } from '../models/Feedback';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { HUMAN_FEEDBACK_RECEIVED } from '../types/LearningEvents';

export class FeedbackProcessor {
  constructor(private dispatcher: KernelEventDispatcher) {}

  public process(feedback: Feedback): void {
     // Validate and sanitize comments
     if (feedback.comments) {
        feedback.comments = feedback.comments.replace(/password|secret|key/gi, '[REDACTED]');
     }
     
     this.dispatcher.publish(HUMAN_FEEDBACK_RECEIVED, { feedbackId: feedback.feedbackId });
  }
}
