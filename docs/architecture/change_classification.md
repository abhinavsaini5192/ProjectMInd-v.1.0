# Change Classification

Every processed commit is analyzed by the `ChangeClassifier` and tagged with one or multiple semantic labels:
- Feature Addition
- Bug Fix
- Refactor
- Documentation
- Configuration
- Dependency Update
- Test
- Security
- Performance
- Architecture
- Build
- CI/CD
- Migration

This allows ProjectMind to understand the *intent* of a change, rather than just the structural diff.
