# Feature Intelligence Engine

The Feature Intelligence Engine (L2.6) transitions ProjectMind from semantic structural analysis to pure Domain logic.

Instead of answering "Does Function A call Function B?", ProjectMind can now answer "Does Authentication illegally depend on Payments?".

## Architecture
The engine relies heavily on a multi-signal **FeatureDetector**. 
By aggregating signals from Naming, Dependencies, Routes, and potentially future AI heuristics, it calculates a holistic `Confidence` score that a cluster of symbols represents a coherent business Feature.

These Features are then exposed via the `FeatureResolver`, which serves as the ultimate API backend for the future Decision Engine.
