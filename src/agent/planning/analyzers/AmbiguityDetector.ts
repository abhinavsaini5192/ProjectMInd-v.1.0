export interface AmbiguityResult {
  ambiguous: boolean;
  confidence: number;
  possibleTargets: string[];
  requiresClarification: boolean;
}

export class AmbiguityDetector {
  
  public detect(request: string, knownContext: string[]): AmbiguityResult {
    const isVague = request.length < 10 || request.split(' ').length < 3;
    
    if (isVague) {
      return {
        ambiguous: true,
        confidence: 0.3,
        possibleTargets: [],
        requiresClarification: true
      };
    }

    return {
      ambiguous: false,
      confidence: 0.9,
      possibleTargets: knownContext,
      requiresClarification: false
    };
  }
}
