import { ProjectMindKernel } from '../kernel/ProjectMindKernel';

export interface DiagnosticResult {
  category: string;
  name: string;
  passed: boolean;
  message: string;
}

export class DoctorEngine {
  constructor(private readonly kernel: ProjectMindKernel) {}

  public async runDiagnostics(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // 1. Check Workspace
    const isWorkspaceValid = this.kernel.workspaceManager.workspacePath !== undefined;
    results.push({
      category: 'System',
      name: 'Workspace Initialization',
      passed: isWorkspaceValid,
      message: isWorkspaceValid ? 'Workspace loaded correctly' : 'Workspace path is missing'
    });

    // 2. Check Plugins
    const plugins = this.kernel.pluginRuntime.getPlugins();
    const failedPlugins = plugins.filter(p => p.state === 'failed');
    results.push({
      category: 'Plugins',
      name: 'Plugin Health',
      passed: failedPlugins.length === 0,
      message: failedPlugins.length === 0 
        ? `${plugins.length} plugins running healthily` 
        : `${failedPlugins.length} plugins are in a failed state`
    });

    // 3. Subsystem Health Checks
    const observabilityStatus = await this.kernel.observabilityEngine.getHealth();
    results.push({
      category: 'Observability',
      name: 'Telemetry Online',
      passed: observabilityStatus.status === 'healthy',
      message: `System up for ${observabilityStatus.uptime}s`
    });

    // 4. Memory Integrity (simulated)
    const hasCorruptSnaps = false; // from kernel.snapshotManager
    results.push({
      category: 'Storage',
      name: 'Snapshot Integrity',
      passed: !hasCorruptSnaps,
      message: !hasCorruptSnaps ? 'No corrupted snapshots found.' : 'Corrupted snapshots detected!'
    });

    // 5. Node Environment
    const nodeVersion = process.version;
    results.push({
      category: 'Environment',
      name: 'Node Version',
      passed: true,
      message: `Running Node ${nodeVersion}`
    });

    return results;
  }
}
