# Security & Sanitization Architecture

## 1. Zero-Exposure Secret Redaction

Phase 6.6 strictly protects repository confidentiality. No secret or API token is ever logged, retained in evidence, or surfaced in generated reports:

- Every text output from `HealthSignalHelper`, `RiskDetectorHelper`, and `FeatureHealthExplainer` passes through `SecuritySanitizer.redactSecrets`.
- AWS Access Keys (`AKIA...`), JWT Tokens (`eyJ...`), Private Keys (`-----BEGIN...`), and password assignments are replaced with their respective `[REDACTED_*]` placeholders.

---

## 2. Prompt Injection Defense

Documentation and untrusted resources are checked for prompt injection attempts:

- `SecuritySanitizer.checkPromptInjection(text, false)` detects instruction override attempts (e.g. *"ignore all previous instructions"*).
- When prompt injection is suspected, the engine generates a `PROMPT_INJECTION_VULNERABILITY` health signal and elevates `SecurityRiskDetector` to **CRITICAL** severity.

---

## 3. Read-Only Boundary Protection

- No write operations to repository source files.
- No network connections or remote requests.
- No dynamic shell or subprocess executions.
