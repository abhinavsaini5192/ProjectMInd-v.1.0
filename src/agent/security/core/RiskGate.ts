import { AgentAction } from '../../actions/models/AgentAction';

export class RiskGate {
  public evaluateRisk(action: AgentAction): 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY' {
    switch (action.risk) {
       case 'LOW':
          return 'ALLOW';
       case 'MEDIUM':
          return 'ALLOW';
       case 'HIGH':
          return 'REQUIRE_APPROVAL';
       case 'CRITICAL':
          return 'REQUIRE_APPROVAL'; // Or deny depending on implementation, but usually requires a human look
       default:
          return 'REQUIRE_APPROVAL';
    }
  }
}
