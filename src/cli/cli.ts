import { ProjectMindKernel } from '../kernel/ProjectMindKernel';
import { CommandRouter } from './CommandRouter';
import { PluginCommand } from './PluginCommand';
import { InitCommand } from './commands/InitCommand';
import { DoctorCommand } from './commands/DoctorCommand';
import { BenchmarkCommand } from './commands/BenchmarkCommand';
import { CompatibilityCommand } from './commands/CompatibilityCommand';

/**
 * Entry point for the CLI.
 */
async function main() {
  const args = process.argv.slice(2);
  const workspacePath = process.cwd();
  
  const kernel = new ProjectMindKernel(workspacePath);
  const router = new CommandRouter();

  // Register commands
  router.register(new InitCommand());
  router.register(new DoctorCommand());
  router.register(new BenchmarkCommand());
  router.register(new CompatibilityCommand());
  
  // We wrap the existing PluginCommand so it fits the Command interface
  router.register({
    name: 'plugin',
    description: 'Manage ProjectMind plugins',
    execute: async (args: string[], k: ProjectMindKernel) => {
      const cmd = new PluginCommand(k);
      await cmd.execute(args);
    }
  });

  try {
    // Only initialize necessary components for CLI
    await kernel.initialize();
    await router.route(args, kernel);
  } catch (error: any) {
    console.error(`CLI Error: ${error.message}`);
    process.exit(1);
  } finally {
    await kernel.shutdown();
  }
}

if (require.main === module) {
  main();
}
