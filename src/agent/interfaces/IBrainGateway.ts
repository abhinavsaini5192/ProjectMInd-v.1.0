import { AgentTask } from '../models/AgentTask';
import { ContextPackage } from '../../intelligence/fusion/models/ContextPackage';

export interface IBrainGateway {
  /**
   * Translates an AgentTask into a structured ContextPackage
   * representing the Brain's understanding and fused intelligence.
   */
  requestContext(task: AgentTask): Promise<ContextPackage>;
}
