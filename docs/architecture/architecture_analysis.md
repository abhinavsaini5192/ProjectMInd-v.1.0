# Architecture Analysis Engine

The Architecture Analyzer actively watches the semantic dependency graph and evaluates it against architectural rules.

## The Rule Engine
Rather than hardcoded scripts, the `ArchitectureRuleEngine` supports pluggable `ArchitectureRule` objects. 
This allows:
1. Universal Rules (e.g. Circular Dependency detection)
2. Framework-specific Rules (e.g. Next.js App Router rules)
3. Custom User Rules

## Violations
When a rule breaks, the engine fires an `ArchitectureViolation` event (e.g. severity: `High`, type: `CircularDependency`). The Kernel dispatcher can then log this or inform an SLM.
