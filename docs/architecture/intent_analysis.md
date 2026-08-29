# Intent Analysis

The `IntentAnalyzer` translates a raw user text input into a strongly typed `IntentType` (e.g. `FEATURE_ADD`, `BUG_FIX`, `REFACTOR`).

For the MVP, this relies on deterministic heuristic keyword matching. Future iterations of the Intent system (in the SLM integration phase) will replace the heuristic engine with a fine-tuned classification layer, while maintaining the exact same I/O interface (`IntentType` & Confidence Score).
