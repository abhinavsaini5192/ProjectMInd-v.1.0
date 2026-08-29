import { Evidence } from './Evidence';

export interface Hypothesis {
  id: string;
  description: string;
  evidence: Evidence[];
  confidence: number;
  status: 'ACTIVE' | 'REJECTED' | 'CONFIRMED' | 'UNCERTAIN';
}
