import { VerificationResult, OverallStatus } from '../../verification/models/VerificationResult';
import { FailureCategory } from './FailureCategory';
import { FailureSeverity } from './FailureSeverity';
import { CheckResult, CheckStatus } from '../../verification/models/CheckResult';

export class FailureClassifier {
  public classify(result: VerificationResult): { category: FailureCategory, severity: FailureSeverity } {
    if (result.overallStatus === OverallStatus.VERIFIED) {
      return { category: FailureCategory.UNKNOWN_FAILURE, severity: FailureSeverity.INFO };
    }

    const failedChecks = result.checks.filter(c => c.status === CheckStatus.FAIL);

    if (failedChecks.some(c => c.type === 'SYNTAX')) {
      return { category: FailureCategory.SYNTAX_FAILURE, severity: FailureSeverity.CRITICAL };
    }

    if (failedChecks.some(c => c.type === 'ARCHITECTURE' || c.type === 'SECURITY')) {
      return { category: FailureCategory.SECURITY_FAILURE, severity: FailureSeverity.CRITICAL };
    }

    if (failedChecks.some(c => c.type === 'BUILD')) {
      return { category: FailureCategory.BUILD_FAILURE, severity: FailureSeverity.ERROR };
    }

    if (failedChecks.some(c => c.type === 'TYPE')) {
      return { category: FailureCategory.TYPE_FAILURE, severity: FailureSeverity.ERROR };
    }

    if (failedChecks.some(c => c.type === 'TEST')) {
      return { category: FailureCategory.TEST_FAILURE, severity: FailureSeverity.WARNING };
    }

    return { category: FailureCategory.UNKNOWN_FAILURE, severity: FailureSeverity.ERROR };
  }
}
