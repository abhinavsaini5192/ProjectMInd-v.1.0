# Security & Sanitization

## Overview

ProjectMind processes repositories that may contain sensitive data, authentication tokens, API keys, or untrusted user input.

Phase 6.5 enforces strict security safeguards throughout the behavioral analysis pipeline.

---

## 1. Zero Raw Code Storage

Behavior is captured semantically via:
- Step types (`FeatureFlowStep`)
- Relation types (`FeatureFlowRelationType`)
- Stable resource references (`resourceId`, `resourceType`)
- High-level transformations and conditions

Arbitrary source-code text blocks and compiler-level AST if-nodes are never stored.

---

## 2. Secret Redaction

All labels, descriptions, and metadata properties are filtered through `SecuritySanitizer.redactSecrets`:
- **Passwords**: `password: '...'` $\to$ `password: '[REDACTED_SECRET]'`
- **AWS Keys**: `AKIA...` $\to$ `[REDACTED_AWS_KEY]`
- **JWT Tokens**: `eyJ...` $\to$ `[REDACTED_JWT_TOKEN]`
- **Private Keys**: `-----BEGIN PRIVATE KEY-----` $\to$ `[REDACTED_PRIVATE_KEY]`

---

## 3. Untrusted Documentation & Injection Filtering

Input text from documentation, markdown files, and commit messages is treated as untrusted:
- `SecuritySanitizer.checkPromptInjection` detects and replaces injection payloads (e.g. "ignore all previous instructions") with `[UNTRUSTED_INJECTION_FILTERED]`.
- Malicious text cannot override engine analysis or corrupt confidence scores.

---

## 4. Read-Only Execution

The behavioral engine never executes repository code, spawns shell commands, or invokes external network APIs. Analysis is performed statically against extraction artifacts.
