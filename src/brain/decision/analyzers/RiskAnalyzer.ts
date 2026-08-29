import { Risk } from '../models/Risk';

export class RiskAnalyzer {
  public analyze(affectedFeatures: string[]): Risk {
    let score = 0.1;
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    const factors: string[] = [];
    const evidence: string[] = [];

    if (affectedFeatures.length > 2) {
      score = 0.6;
      level = 'HIGH';
      factors.push('High Blast Radius');
      evidence.push(`Modification affects ${affectedFeatures.length} downstream features.`);
    }

    if (affectedFeatures.includes('feat_auth') || affectedFeatures.includes('feat_payment')) {
      score = 0.9;
      level = 'CRITICAL';
      factors.push('Sensitive Core Domain');
      evidence.push('Target involves authentication or financial processing.');
    }

    return { score, level, factors, evidence };
  }
}
