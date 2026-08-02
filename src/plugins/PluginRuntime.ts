import { Plugin, PluginState } from '../interfaces/Plugin';
import { PluginManifest, validateManifest } from './PluginManifest';
import { DependencyResolver } from './DependencyResolver';
import { PermissionManager } from './PermissionManager';
import { CapabilityRegistry } from './CapabilityRegistry';
import { ProjectMindSDK } from '../sdk/ProjectMindSDK';
import { ProjectMindKernel } from '../kernel/ProjectMindKernel';

/**
 * The PluginRuntime is responsible for the complete lifecycle of all plugins.
 */
export class PluginRuntime {
  private plugins: Map<string, Plugin> = new Map();
  private manifests: Map<string, PluginManifest> = new Map();

  public readonly permissionManager = new PermissionManager();
  public readonly capabilityRegistry = new CapabilityRegistry();

  constructor(private readonly kernel: ProjectMindKernel) {}

  /**
   * Registers a plugin manually. In a full implementation, this would dynamically import modules.
   * @param manifestRaw The raw JSON manifest.
   * @param plugin The instantiated Plugin object.
   */
  public registerPlugin(manifestRaw: unknown, plugin: Plugin): void {
    const manifest = validateManifest(manifestRaw);
    
    if (plugin.id !== manifest.id) {
      throw new Error(`Plugin ID mismatch: Instance ID '${plugin.id}' does not match manifest ID '${manifest.id}'`);
    }

    this.manifests.set(plugin.id, manifest);
    this.plugins.set(plugin.id, plugin);
    plugin.state = PluginState.INSTALLED;
    
    // Register permissions requested by the plugin
    this.permissionManager.registerPluginPermissions(plugin.id, manifest.permissions);
  }

  /**
   * Initializes all installed plugins in dependency-resolved order.
   */
  public async initializeAll(): Promise<void> {
    const sortedManifests = DependencyResolver.sort(Array.from(this.manifests.values()));

    for (const manifest of sortedManifests) {
      const plugin = this.plugins.get(manifest.id)!;
      try {
        const sdk = new ProjectMindSDK(
          plugin.id,
          this.kernel,
          this.permissionManager,
          this.capabilityRegistry
        );

        plugin.state = PluginState.INITIALIZED;
        await plugin.initialize(sdk);
        this.kernel.eventDispatcher.dispatch('PluginInitialized.v1', { pluginId: plugin.id });
      } catch (err: any) {
        plugin.state = PluginState.FAILED;
        console.error(`Failed to initialize plugin ${plugin.id}:`, err);
        this.kernel.eventDispatcher.dispatch('PluginFailed.v1', { pluginId: plugin.id, error: err.message });
      }
    }
  }

  /**
   * Starts all initialized plugins.
   */
  public async startAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.state === PluginState.INITIALIZED) {
        try {
          plugin.state = PluginState.RUNNING;
          await plugin.start();
          this.kernel.eventDispatcher.dispatch('PluginStarted.v1', { pluginId: plugin.id });
        } catch (err: any) {
          plugin.state = PluginState.FAILED;
          console.error(`Failed to start plugin ${plugin.id}:`, err);
          this.kernel.eventDispatcher.dispatch('PluginFailed.v1', { pluginId: plugin.id, error: err.message });
        }
      }
    }
  }

  /**
   * Stops all running plugins.
   */
  public async stopAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.state === PluginState.RUNNING || plugin.state === PluginState.FAILED) {
        try {
          await plugin.stop();
          plugin.state = PluginState.DISABLED;
        } catch (err) {
          console.error(`Failed to stop plugin ${plugin.id}:`, err);
        }
      }
    }
  }

  /**
   * Get a list of all loaded plugins.
   */
  public getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}
