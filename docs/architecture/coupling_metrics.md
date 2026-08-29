# Coupling Metrics

ProjectMind deeply calculates the standard Robert C. Martin metrics for architectural health:

- **Afferent Coupling (Fan-in)**: How many external modules depend on this symbol?
- **Efferent Coupling (Fan-out)**: How many external modules does this symbol depend on?
- **Instability**: Calculated as `Ce / (Ca + Ce)`. 
  - `0.0` = Completely stable. Changes are hard.
  - `1.0` = Completely unstable. Changes are easy, but it relies heavily on others.
- **Cohesion**: Analyzes whether a module's internal symbols connect to each other, or if they act like a fragmented utility bin.
