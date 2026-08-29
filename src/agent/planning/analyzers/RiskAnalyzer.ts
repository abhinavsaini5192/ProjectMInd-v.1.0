export interface RiskResult {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
}

export class RiskAnalyzer {
  
  public calculateRisk(scope: string[], intent: string): RiskResult {
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    const reasons: string[] = [];

    if (scope.length > 10) {
       level = 'HIGH';
       reasons.push('Large blast radius (over 10 entities affected).');
    } else if (scope.length > 5) {
       level = 'MEDIUM';
       reasons.push('Moderate blast radius.');
    }

    if (intent === 'SECURITY' || scope.some(s => s.toLowerCase().includes('auth'))) {
       level = level === 'HIGH' ? 'CRITICAL' : 'HIGH';
       reasons.push('Touches security-critical or authentication paths.');
    }

    if (reasons.length === 0) {
       reasons.push('Isolated change with minimal dependencies.');
    }

    return { level, reasons };
  }
}
