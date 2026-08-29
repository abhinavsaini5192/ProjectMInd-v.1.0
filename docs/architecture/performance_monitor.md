# Performance Monitor

The `KernelMetricsEngine` tracks execution times and subsystem overhead.

## Tracked Metrics
- **Memory Usage**: Sampled from V8/Node.js `process.memoryUsage()`.
- **Event Bus Traffic**: Count of all messages pumped through the `KernelEventDispatcher`.
- **Task Success/Failure Ratio**: Total executed vs Failed tasks within the `KernelJobQueue`.
- **Uptime**: Platform persistence time.
