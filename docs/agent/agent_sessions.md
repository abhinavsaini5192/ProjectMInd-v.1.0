# Agent Sessions

The `AgentSession` tracks the historical execution footprint of an agent.

## Capabilities
1. **Transition History**: It records every state change (e.g., `INITIALIZING` -> `UNDERSTANDING`) along with accurate timestamps.
2. **Context Usage Tracking**: When the agent requests a `ContextPackage` from the `IBrainGateway`, the session explicitly records which context entities (files, architectures, etc.) were actually utilized.

This data is crucial for Phase L3.4 (Decision Learning & Feedback). By tracking what context an agent *actually* used during a successful session, the Brain can calibrate its future context recommendations.
