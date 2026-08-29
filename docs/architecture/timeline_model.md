# Timeline Model

ProjectMind maintains a globally queryable `RepositoryTimeline` which aggregates every `EvolutionEvent`.

But more importantly, ProjectMind maintains specialized sub-timelines:
- **Feature Evolution Tracker**: Tracks when Features are Created, Expanded, Split, or Deprecated.
- **Architecture Evolution Tracker**: Tracks when layers shift or violations occur over time.
- **Dependency Evolution Tracker**: Tracks edge lifecycles between symbols.
- **Symbol Evolution Tracker**: Tracks the lifespan of specific files/classes/functions.

This allows the Decision Engine to ask "When was the JWT feature introduced?" and get an exact history trace.
