import { AgentPermission } from './AgentPermission';

export class PermissionSet {
  private permissions: Set<AgentPermission> = new Set();

  public grant(permission: AgentPermission): void {
    this.permissions.add(permission);
  }

  public revoke(permission: AgentPermission): void {
    this.permissions.delete(permission);
  }

  public hasPermission(permission: AgentPermission): boolean {
    return this.permissions.has(permission);
  }

  public inspect(): AgentPermission[] {
    return Array.from(this.permissions);
  }

  public merge(other: PermissionSet): void {
    for (const p of other.inspect()) {
      this.grant(p);
    }
  }
}
