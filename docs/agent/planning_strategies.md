# Planning Strategies

ProjectMind uses the Strategy pattern to emit task-appropriate lifecycles via the `IPlanningStrategy` interface.

## Supported Strategies
- **BugFixStrategy**: Focuses heavily on reproduction and investigation. 
  *(INVESTIGATION -> MODIFICATION -> VERIFICATION)*
- **FeatureStrategy**: Requires design phases and documentation.
  *(DESIGN -> MODIFICATION -> VERIFICATION -> DOCUMENTATION)*

By abstracting this into strategies, ProjectMind never blindly applies a "one size fits all" code-generation flow to an architecture task.
