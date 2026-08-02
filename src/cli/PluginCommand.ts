import { ProjectMindKernel } from '../kernel/ProjectMindKernel';
import { PluginState } from '../interfaces';

/**
 * Handles 'plugin' commands from the CLI.
 */
export class PluginCommand {
  constructor(private readonly kernel: ProjectMindKernel) {}

  public async execute(args: string[]): Promise<void> {
    const action = args[0];

    switch (action) {
      case 'install':
        console.log(`Installing plugin: ${args.slice(1).join(' ')}`);
        // Implementation for downloading/installing would go here
        break;
      
      case 'remove':
        console.log(`Removing plugin: ${args.slice(1).join(' ')}`);
        // Implementation for removing would go here
        break;
        
      case 'enable':
        console.log(`Enabling plugin: ${args[1]}`);
        break;
        
      case 'disable':
        console.log(`Disabling plugin: ${args[1]}`);
        break;

      case 'list':
        this.listPlugins();
        break;

      case 'info':
        this.pluginInfo(args[1]);
        break;

      default:
        this.printHelp();
    }
  }

  private listPlugins(): void {
    const plugins = this.kernel.pluginRuntime.getPlugins();
    console.log(`\nInstalled Plugins (${plugins.length}):`);
    plugins.forEach(p => {
      console.log(`- ${p.name} [${p.id}] v${p.version} - State: ${p.state}`);
    });
    console.log('');
  }

  private pluginInfo(pluginId: string): void {
    if (!pluginId) {
      console.error('Error: Please provide a plugin ID.');
      return;
    }

    const plugin = this.kernel.pluginRuntime.getPlugins().find(p => p.id === pluginId);
    if (!plugin) {
      console.error(`Error: Plugin '${pluginId}' not found.`);
      return;
    }

    console.log(`\nPlugin Info: ${plugin.name}`);
    console.log(`ID: ${plugin.id}`);
    console.log(`Version: ${plugin.version}`);
    console.log(`State: ${plugin.state}`);
    console.log('');
  }

  private printHelp(): void {
    console.log(`
ProjectMind Plugin Management

Usage: projectmind plugin <command> [args]

Commands:
  install <url/path>   Installs a new plugin
  remove <plugin_id>   Removes an installed plugin
  enable <plugin_id>   Enables a plugin
  disable <plugin_id>  Disables a plugin
  list                 Lists all installed plugins
  info <plugin_id>     Shows detailed information about a plugin
`);
  }
}
