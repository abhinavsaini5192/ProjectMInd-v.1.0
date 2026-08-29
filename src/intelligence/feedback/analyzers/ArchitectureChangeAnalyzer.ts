import { ChangeRecord } from '../models/ChangeRecord';
import { ExecutionObservation } from '../models/ExecutionObservation';

export interface ArchitectureAnalysisReport {
  hasNewViolations: boolean;
  violationsDetected: string[];
  violationsResolved: string[];
  records: ChangeRecord[];
}

export class ArchitectureChangeAnalyzer {
  public analyze(obs: ExecutionObservation): ArchitectureAnalysisReport {
    const detected = obs.architectureResults?.violationsDetected || [];
    const resolved = obs.architectureResults?.violationsResolved || [];

    const records: ChangeRecord[] = [];
    if (detected.length > 0 || resolved.length > 0) {
      records.push({
        resourceId: 'architecture_graph',
        resourceType: 'ARCHITECTURE',
        operation: 'ARCHITECTURE_CHANGED',
        beforeState: `Violations: ${detected.join(', ')}`,
        afterState: `Resolved: ${resolved.join(', ')}`,
        source: 'ArchitectureChangeAnalyzer',
        executionId: obs.executionId,
        confidence: 0.95
      });
    }

    return {
      hasNewViolations: detected.length > 0,
      violationsDetected: detected,
      violationsResolved: resolved,
      records
    };
  }
}
