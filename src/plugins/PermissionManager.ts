export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

/**
 * Manages and enforces permissions for plugins.
 */
export class PermissionManager {
  // pluginId -> Set of permissions
  private pluginPermissions: Map<string, Set<string>> = new Map();

  /**
   * Registers a plugin's permissions, typically extracted from the manifest.
   * @param pluginId ID of the plugin.
   * @param permissions Array of requested permission strings.
   */
  public registerPluginPermissions(pluginId: string, permissions: string[] = []): void {
    this.pluginPermissions.set(pluginId, new Set(permissions));
  }

  /**
   * Unregisters a plugin's permissions when unloaded.
   * @param pluginId ID of the plugin.
   */
  public unregisterPlugin(pluginId: string): void {
    this.pluginPermissions.delete(pluginId);
  }

  /**
   * Checks if a plugin has a specific permission.
   * @param pluginId ID of the plugin.
   * @param permission The required permission (e.g., 'ReadRepository').
   * @returns True if allowed, false otherwise.
   */
  public hasPermission(pluginId: string, permission: string): boolean {
    const perms = this.pluginPermissions.get(pluginId);
    return perms ? perms.has(permission) : false;
  }

  /**
   * Throws a SecurityError if the plugin lacks the required permission.
   * @param pluginId ID of the plugin.
   * @param permission The required permission.
   */
  public assertPermission(pluginId: string, permission: string): void {
    if (!this.hasPermission(pluginId, permission)) {
      throw new SecurityError(`Plugin '${pluginId}' is missing required permission: '${permission}'`);
    }
  }
}
