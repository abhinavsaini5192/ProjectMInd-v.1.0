import { AgentAction } from '../../actions/models/AgentAction';
import { ActionType } from '../../actions/models/ActionType';

export class ProtectionManager {
  private protectedPatterns = [
    /^\.git\/.*/,
    /^\.env$/,
    /^\.env\..*/,
    /.*\.pem$/,
    /.*\.key$/,
    /^credentials\..*/,
    /^secrets\..*/
  ];

  public isProtected(target: string): boolean {
    return this.protectedPatterns.some(pattern => pattern.test(target));
  }

  public evaluateProtection(action: AgentAction): 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY' {
    if (!this.isProtected(action.target)) {
       return 'ALLOW';
    }

    // It is protected. Read is generally allowed but might require approval depending on policy.
    // Modification or Deletion of protected resources is hard DENY unless explicitly approved, 
    // but default behavior for deletion of protected is DENY.
    
    if (action.type === ActionType.DELETE_FILE) {
       return 'DENY'; // NEVER delete .git or keys automatically
    }

    if ([ActionType.EDIT_FILE, ActionType.CREATE_FILE].includes(action.type)) {
       return 'REQUIRE_APPROVAL'; // Can't write to .env without human OK
    }

    if ([ActionType.READ_FILE, ActionType.READ_SYMBOL, ActionType.SEARCH_TEXT].includes(action.type)) {
       return 'REQUIRE_APPROVAL'; // Even reading secrets needs explicit approval in a safe system
    }

    return 'ALLOW';
  }
}
