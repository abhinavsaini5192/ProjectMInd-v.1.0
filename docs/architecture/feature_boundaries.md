# Feature Boundaries

Once Features are established, we can define strict Architectural Boundaries.

The `FeatureBoundaryAnalyzer` ensures that specific features do not "bleed" into unauthorized domains.

If a developer accidentally imports a `PaymentGatewayService` into the `LoginController`, the Boundary Analyzer will detect that a symbol owned by `Authentication` has formed an `IDependency` on a symbol owned by `Payment`. 

If `Payment` is not in the `allowedOutboundFeatureIds` list for `Authentication`, a `FeatureBoundaryBleed` Architecture Violation is raised.
