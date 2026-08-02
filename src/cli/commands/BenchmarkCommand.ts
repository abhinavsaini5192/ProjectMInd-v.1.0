import { Command } from '../CommandRouter';
import { ProjectMindKernel } from '../../kernel/ProjectMindKernel';
import { BenchmarkSuite } from '../../benchmark/BenchmarkSuite';

export class BenchmarkCommand implements Command {
  name = 'benchmark';
  description = 'Runs performance benchmarks on core ProjectMind engines.';

  public async execute(args: string[], kernel: ProjectMindKernel): Promise<void> {
    console.log('Starting Benchmark Suite...\n');
    const suite = new BenchmarkSuite(kernel);
    await suite.runAll();
  }
}
