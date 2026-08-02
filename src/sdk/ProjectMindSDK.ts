import { ProjectMindKernel } from '../kernel/ProjectMindKernel';
import { PermissionManager } from '../plugins/PermissionManager';
import { CapabilityRegistry } from '../plugins/CapabilityRegistry';
import { EventListener } from '../interfaces';

/**
 * The Developer SDK provided to every initialized plugin.
 * It acts as a facade over the Kernel, enforcing permissions and
 * hiding internal implementation details.
 */
export class ProjectMindSDK {
  constructor(
    private readonly pluginId: string,
    private readonly kernel: ProjectMindKernel,
    private readonly permissionManager: PermissionManager,
    private readonly capabilityRegistry: CapabilityRegistry
  ) {}

  /**
   * Registers a capability provided by this plugin.
   * @param capability The capability name (e.g., 'ProvidesParser').
   */
  public registerCapability(capability: string): void {
    this.capabilityRegistry.registerCapability(capability, this.pluginId);
  }

  // --- Events API ---

  /**
   * Subscribes to an event on the ProjectMind Event Bus.
   * Requires 'ReadEvents' permission.
   */
  public subscribeEvent<T = any>(eventType: string, listener: EventListener<T>): void {
    this.permissionManager.assertPermission(this.pluginId, 'ReadEvents');
    this.kernel.eventDispatcher.on(eventType, listener);
  }

  /**
   * Publishes an event to the ProjectMind Event Bus.
   * Requires 'PublishEvents' permission.
   */
  public publishEvent<T = any>(eventType: string, payload: T): void {
    this.permissionManager.assertPermission(this.pluginId, 'PublishEvents');
    this.kernel.eventDispatcher.dispatch(eventType, payload);
  }

  // --- Configuration API ---
  
  /**
   * Gets configuration. Requires 'ReadConfiguration' permission.
   */
  public getConfig(key: string): any {
    this.permissionManager.assertPermission(this.pluginId, 'ReadConfiguration');
    // Assuming a generic getConfig on configManager
    return (this.kernel.configManager as any).getConfig ? (this.kernel.configManager as any).getConfig(key) : undefined;
  }

  // --- Workspace API ---

  /**
   * Gets the current workspace path. Requires 'ReadRepository' permission.
   */
  public getWorkspacePath(): string {
    this.permissionManager.assertPermission(this.pluginId, 'ReadRepository');
    return this.kernel.workspaceManager.workspacePath;
  }
}
