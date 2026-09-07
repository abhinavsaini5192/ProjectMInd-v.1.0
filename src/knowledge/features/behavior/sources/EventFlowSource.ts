import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import type { FeatureFlowEdge } from '../models/FeatureFlowEdge';
import type { FeatureFlowNode } from '../models/FeatureFlowNode';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class EventFlowSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'EVENT_FLOW_SOURCE';
  public readonly sourceType = 'MESSAGING';
  public readonly priority = 78;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    // 1. Check mapped symbols for event/queue patterns
    const symbols = BehaviorSourceHelper.getMappedResourcesByType(context.mappings, 'SYMBOL');
    const eventSymbols = symbols.filter(s => {
      const lower = s.resourceId.toLowerCase();
      return (
        lower.includes('event') ||
        lower.includes('emitter') ||
        lower.includes('queue') ||
        lower.includes('worker') ||
        lower.includes('publish') ||
        lower.includes('subscriber') ||
        lower.includes('listener') ||
        s.metadata?.isEvent === true
      );
    });

    // 2. Check context.extraction?.integrationEvents
    const extractedEvents = context.extraction?.integrationEvents || [];

    for (const sym of eventSymbols) {
      const isQueue = sym.resourceId.toLowerCase().includes('queue') || sym.resourceId.toLowerCase().includes('worker');
      const stepType = isQueue ? 'QUEUE' : 'EVENT';

      const ev = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'EVENT_SYMBOL_DETECTED',
        `Asynchronous event symbol detected: ${sym.resourceId}`,
        0.86
      );

      const eventNode = BehaviorSourceHelper.createNode(
        sym.resourceId,
        'SYMBOL',
        stepType,
        `Async ${stepType}: ${sym.resourceId}`,
        {
          asynchronous: true,
          eventPattern: isQueue ? 'QUEUE_WORKER' : 'PUB_SUB',
        },
        0.86
      );

      // Create a listener / consumer target node
      const consumerNode = BehaviorSourceHelper.createNode(
        `${sym.resourceId}:consumer`,
        'SYMBOL',
        'HANDLER',
        `Handler: on(${sym.resourceId})`,
        { asynchronous: true },
        0.84
      );

      const asyncEdge = BehaviorSourceHelper.createEdge(
        eventNode.nodeId,
        consumerNode.nodeId,
        'TRIGGERS',
        true, // Asynchronous boundary preserved!
        undefined,
        0.86,
        [ev],
        { asynchronous: true }
      );

      candidates.push(
        BehaviorSourceHelper.createCandidate(
          featureId,
          `Async Event Flow: ${sym.resourceId}`,
          'EVENT',
          [eventNode, consumerNode],
          [asyncEdge],
          [ev],
          this.sourceId,
          0.86,
          { asynchronous: true }
        )
      );
    }

    for (const extEv of extractedEvents) {
      const alreadyAdded = candidates.some(c => c.name.includes(extEv.name || extEv.id));
      if (!alreadyAdded) {
        const ev = BehaviorSourceHelper.createEvidence(
          this.sourceType,
          this.sourceId,
          'INTEGRATION_EVENT_EXTRACTED',
          `Extracted integration event: ${extEv.name || extEv.id}`,
          0.88
        );

        const node = BehaviorSourceHelper.createNode(
          extEv.id || extEv.name,
          'SYMBOL',
          'EVENT',
          `Event: ${extEv.name || extEv.id}`,
          { asynchronous: true },
          0.88
        );

        candidates.push(
          BehaviorSourceHelper.createCandidate(
            featureId,
            `Event: ${extEv.name || extEv.id}`,
            'EVENT',
            [node],
            [],
            [ev],
            this.sourceId,
            0.88,
            { asynchronous: true }
          )
        );
      }
    }

    return candidates;
  }
}
