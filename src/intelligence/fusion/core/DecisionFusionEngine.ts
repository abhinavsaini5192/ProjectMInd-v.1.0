import { SLMTaskType } from '../../slm/models/SLMTaskType';
import { SLMDecisionRouter, RoutingDecision } from '../../slm/routing/SLMDecisionRouter';
import { ConfidenceCalibrator } from '../../slm/routing/ConfidenceCalibrator';
import { TaskWeightingPolicy } from './TaskWeightingPolicy';
import { ContradictionDetector } from './ContradictionDetector';
import { FinalDecision, FusedEntity, FusionContradiction } from '../models/FusionModels';

export class DecisionFusionEngine {
  constructor(
    private router: SLMDecisionRouter,
    private policy: TaskWeightingPolicy,
    private calibrator: ConfidenceCalibrator,
    private contradictionDetector: ContradictionDetector
  ) {}

  public fuse(
    taskId: string,
    taskType: SLMTaskType,
    isSecurityCritical: boolean,
    deterministicScores: Record<string, number>,
    slmScores: Record<string, number>,
    rawSlmConfidence: number
  ): FinalDecision {
    
    const routing = this.router.routeTask(taskType, isSecurityCritical);
    const calibrationFactor = this.calibrator.calibrate(rawSlmConfidence);
    
    let detWeight = 1.0;
    let slmWeight = 0.0;

    if (routing === RoutingDecision.SLM_PRIMARY || routing === RoutingDecision.HYBRID) {
       const weights = isSecurityCritical ? this.policy.getSecurityWeights() : this.policy.getWeights(taskType);
       detWeight = weights.deterministicWeight;
       slmWeight = weights.slmWeight;
    }

    const fusedEntities: FusedEntity[] = [];
    const contradictions: FusionContradiction[] = [];

    // Collect all unique entity IDs
    const allEntities = new Set([...Object.keys(deterministicScores), ...Object.keys(slmScores)]);

    for (const entityId of allEntities) {
       const detScore = deterministicScores[entityId] || 0.0;
       let slmScore = slmScores[entityId] || 0.0;
       
       // Handle missing SLM data explicitly if SLM was bypassed
       if (routing === RoutingDecision.DETERMINISTIC_ONLY) {
          slmScore = 0.0;
       }

       // Core Fusion Formula
       // SLM influence is gated by its historical trust calibration
       const finalScore = (detScore * detWeight) + (slmScore * slmWeight * calibrationFactor);

       const contradiction = this.contradictionDetector.detectAndResolve(entityId, detScore, slmScore, detWeight, slmWeight);
       if (contradiction) {
          contradictions.push(contradiction);
       }

       fusedEntities.push({
         entityId,
         deterministicScore: detScore,
         slmScore,
         finalScore,
         selected: finalScore >= 0.5, // Default selection threshold
         explanation: `Fused score ${finalScore.toFixed(2)} = (Det: ${detScore.toFixed(2)} * ${detWeight}) + (SLM: ${slmScore.toFixed(2)} * ${slmWeight} * Calib: ${calibrationFactor.toFixed(2)})`
       });
    }

    // Sort by final score descending
    fusedEntities.sort((a, b) => b.finalScore - a.finalScore);

    return {
      decisionId: `dec_fus_${Date.now()}`,
      taskId,
      fusedEntities,
      contradictions,
      routingStrategy: routing,
      trustCalibrationFactor: calibrationFactor,
      deterministicWeightApplied: detWeight,
      slmWeightApplied: slmWeight,
      timestamp: Date.now(),
      brainVersion: 'v2.0'
    };
  }
}
