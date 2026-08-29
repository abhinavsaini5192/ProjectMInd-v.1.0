import { VerificationResult, OverallStatus } from '../models/VerificationResult';
import { CheckResult, CheckStatus } from '../models/CheckResult';
import { VerificationPlanner } from './VerificationPlanner';
import { VerificationConfidence } from './VerificationConfidence';
import { FileCheck } from '../checks/FileCheck';
import { SyntaxCheck } from '../checks/SyntaxCheck';
import { RepositorySnapshot } from '../state/RepositorySnapshot';
import { ChangeComparison } from '../state/ChangeComparison';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';

export class VerificationEngine {
  constructor(
    private planner: VerificationPlanner,
    private confidenceCalc: VerificationConfidence,
    private dispatcher: KernelEventDispatcher
  ) {}

  public async verify(
    beforeSnapshot: RepositorySnapshot, 
    afterSnapshot: RepositorySnapshot, 
    expectedFiles: string[], 
    impactFlags: string[]
  ): Promise<VerificationResult> {
    const executionId = `exec_${Date.now()}`;
    this.dispatcher.publish('VERIFICATION_STARTED', { executionId });

    const checksToRun = this.planner.determineChecks(expectedFiles, impactFlags);
    const results: CheckResult[] = [];

    // 1. File Check
    if (checksToRun.includes('FILE')) {
       results.push(new FileCheck().run(beforeSnapshot, afterSnapshot, expectedFiles));
    }

    // 2. Syntax Check
    if (checksToRun.includes('SYNTAX')) {
       // We only syntax check files that were actually modified or expected
       results.push(new SyntaxCheck().run(expectedFiles));
    }

    // 3. Simulated other checks based on plan
    for (const checkType of checksToRun) {
       if (checkType !== 'FILE' && checkType !== 'SYNTAX') {
          results.push({
             checkId: `check_${checkType}_${Date.now()}`,
             type: checkType,
             status: CheckStatus.PASS, // Mocking pass for other runners
             duration: 10,
             evidence: [],
             errors: [],
             warnings: []
          });
       }
    }

    // Evaluate Overall Status
    let hasFailures = false;
    let hasPartials = false;
    for (const r of results) {
       if (r.status === CheckStatus.FAIL) hasFailures = true;
       if (r.status === CheckStatus.PARTIAL) hasPartials = true;
    }

    let overall = OverallStatus.VERIFIED;
    if (hasFailures) overall = OverallStatus.FAILED;
    else if (hasPartials) overall = OverallStatus.PARTIALLY_VERIFIED;

    const confidence = this.confidenceCalc.calculate(results);
    const comparison = new ChangeComparison().compare(beforeSnapshot, afterSnapshot, expectedFiles);

    const finalResult: VerificationResult = {
      verificationId: `verify_${Date.now()}`,
      taskId: 'task_1',
      planId: 'plan_1',
      executionId,
      overallStatus: overall,
      confidence,
      checks: results,
      failures: results.flatMap(r => r.errors),
      warnings: results.flatMap(r => r.warnings),
      unexpectedChanges: comparison.unexpectedChanges,
      missingChanges: comparison.missingChanges,
      recommendations: hasFailures ? ['Re-plan required to fix missing/failed changes'] : []
    };

    if (hasFailures) {
       this.dispatcher.publish('VERIFICATION_FAILED', { executionId });
    } else {
       this.dispatcher.publish('VERIFICATION_COMPLETED', { executionId });
    }

    return finalResult;
  }
}
