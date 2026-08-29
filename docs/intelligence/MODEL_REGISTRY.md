# Model Registry

The Model Registry maintains a normalized, in-memory database of all known models discovered by `ModelDiscovery`.

## Model Availability
Models can have the following states:
- `AVAILABLE`: Ready for inference.
- `UNAVAILABLE`: Provider is offline or model is missing.
- `LOADING`: Currently being loaded into VRAM.
- `ERROR`: An error occurred during initialization.
- `UNKNOWN`: The model was discovered but its status cannot be verified.

The registry tracks `lastSeen` to gracefully deprecate models that providers no longer report during discovery sweeps.
