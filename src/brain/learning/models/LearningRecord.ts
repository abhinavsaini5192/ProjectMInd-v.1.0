import { Outcome } from './Outcome';
import { AgentSession } from './AgentSession';
import { Feedback } from './Feedback';

export interface LearningRecord {
  recordId: string;
  repositoryId: string;
  decisionId: string;
  task: string;
  snapshotId: string;
  
  contextProvided: string[];
  contextExcluded: string[];
  
  sessions: AgentSession[];
  outcome: Outcome;
  
  contextUtility: {
    useful: string[];
    unused: string[];
    missing: string[];
    misleading: string[];
  };
  
  regressions: string[];
  feedback?: Feedback;
  
  decisionQualityScore: number;
  contextUtilityScore: number;
  policyVersion: string;
  timestamp: number;
}
