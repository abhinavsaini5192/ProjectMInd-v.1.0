import { Plugin } from '../interfaces';

/**
 * Registers and discovers capabilities provided by loaded plugins.
 */
export class CapabilityRegistry {
  // Map of capability name to the list of plugin IDs that provide it.
  private capabilities: Map<string, Set<string>> = new Map();

  /**
   * Registers a capability provided by a plugin.
   * @param capability The capability name (e.g., 'ProvidesParser').
   * @param pluginId The ID of the plugin providing the capability.
   */
  public registerCapability(capability: string, pluginId: string): void {
    if (!this.capabilities.has(capability)) {
      this.capabilities.set(capability, new Set());
    }
    this.capabilities.get(capability)!.add(pluginId);
  }

  /**
   * Removes all capabilities registered by a specific plugin.
   * Useful when unloading a plugin.
   * @param pluginId The ID of the plugin.
   */
  public unregisterPlugin(pluginId: string): void {
    for (const [cap, pluginIds] of this.capabilities.entries()) {
      pluginIds.delete(pluginId);
      if (pluginIds.size === 0) {
        this.capabilities.delete(cap);
      }
    }
  }

  /**
   * Gets all plugin IDs that provide a specific capability.
   * @param capability The capability name.
   * @returns Array of plugin IDs.
   */
  public getPluginsWithCapability(capability: string): string[] {
    const pluginIds = this.capabilities.get(capability);
    return pluginIds ? Array.from(pluginIds) : [];
  }

  /**
   * Gets all capabilities currently registered in the system.
   */
  public getAllCapabilities(): string[] {
    return Array.from(this.capabilities.keys());
  }
}
