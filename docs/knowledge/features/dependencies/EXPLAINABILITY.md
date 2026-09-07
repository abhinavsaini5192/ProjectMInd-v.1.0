# Explainability & Reasoning Architecture

## Principles of Explainability

1. **Evidence-Based Reasoning**:
   ProjectMind does not rely on opaque LLM chain-of-thought tokens. Every dependency must be backed by explicit provenance records (`FeatureRelationshipEvidence`).

2. **Dual Representation**:
   `FeatureDependencyExplainer` produces two synchronized representations:
   - **Machine-Readable**: Structured JSON schema with evidence breakdown, confidence metrics, and identified risk factors.
   - **Human-Readable**: GitHub-flavored Markdown narrative with clean section headers, bulleted evidence points, and risk warnings.

---

## Structured Output Schema

```json
{
  "relationshipId": "rel_billing_auth",
  "source": { "id": "feat_billing", "name": "Billing" },
  "target": { "id": "feat_auth", "name": "Authentication" },
  "relationshipType": "DEPENDS_ON",
  "direction": "DIRECTED",
  "confidence": {
    "level": "VERY_HIGH",
    "score": 0.95,
    "reasons": ["Protected by security middleware", "Imports AuthService"]
  },
  "summary": "Billing depends on Authentication (Confidence: VERY_HIGH, Score: 0.95). Supported by 2 evidence point(s) across 2 signal source(s).",
  "evidenceBySource": {
    "ENDPOINT": { "count": 1, "items": [...] },
    "CODE_DEPENDENCY": { "count": 1, "items": [...] }
  },
  "riskFactors": [],
  "narrative": "### Relationship Explanation: Billing → Authentication\n..."
}
```
