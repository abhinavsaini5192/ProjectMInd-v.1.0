import { Command } from '../CommandRouter';
import { ProjectMindKernel } from '../../kernel/ProjectMindKernel';
import { DoctorEngine } from '../../diagnostics/DoctorEngine';

export class DoctorCommand implements Command {
  name = 'doctor';
  description = 'Runs diagnostics to verify the health of ProjectMind.';

  public async execute(args: string[], kernel: ProjectMindKernel): Promise<void> {
    console.log('Running ProjectMind diagnostics...\n');
    const doctor = new DoctorEngine(kernel);
    const results = await doctor.runDiagnostics();

    results.forEach(result => {
      const statusIcon = result.passed ? '✅' : '❌';
      console.log(`${statusIcon} [${result.category}] ${result.name}: ${result.message}`);
    });
    console.log('');
  }
}
