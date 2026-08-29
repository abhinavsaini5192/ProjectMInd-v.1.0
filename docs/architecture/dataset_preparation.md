# Dataset Preparation

ProjectMind is designed to eventually train its own localized SLM (Small Language Model). Layer 3.4 automatically builds the training dataset for this future capability.

## Eligibility
Not all records become training data. The `DatasetEligibilityValidator` rejects:
- Failed or abandoned tasks.
- Tasks that introduced regressions.
- Tasks with low Context Utility scores.

## Privacy
Before export, the `PrivacyFilter` redacts API keys, passwords, and PII from the task description and human feedback comments to ensure secure model training.

## SLM Output
The generated `TrainingExample` trains the future SLM to predict the optimal `recommendedContextIds` based purely on the `task` and `repositoryStateSummary`.
