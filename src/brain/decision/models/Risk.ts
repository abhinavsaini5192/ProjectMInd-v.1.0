export interface Risk {
  score: number; // 0.0 to 1.0
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
  evidence: string[];
}
