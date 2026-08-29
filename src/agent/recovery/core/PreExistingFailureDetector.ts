import { VerificationResult, OverallStatus } from '../../verification/models/VerificationResult';

export class PreExistingFailureDetector {
  public detect(beforeVerification: VerificationResult, afterVerification: VerificationResult): { isNew: boolean, newFailures: string[] } {
    if (beforeVerification.overallStatus === OverallStatus.VERIFIED && afterVerification.overallStatus !== OverallStatus.VERIFIED) {
       return { isNew: true, newFailures: afterVerification.failures };
    }

    const newFailures = afterVerification.failures.filter(f => !beforeVerification.failures.includes(f));
    
    return {
      isNew: newFailures.length > 0,
      newFailures
    };
  }
}
