# Loop Detection & Stall Prevention

The `LoopGuard` and `ProgressGuard` detect degenerative execution patterns:

## Detected Patterns
1. **Repeated Failing Plan**: Consecutive cycles executing the exact same failing plan without modification triggers `TaskStalledError`.
2. **Oscillating Loop ($A \rightarrow B \rightarrow A \rightarrow B$)**: Alternating cycles trapped between two contradictory plans triggers `TaskStalledError`.
3. **Zero Progress**: Cycles failing to resolve issues, complete goals, or pass tests trigger stall escalation to `WAITING_FOR_USER` or `STALLED`.
