# Verification Quality & Test Assessment

## Overview

Verification quality evaluates how thoroughly a feature is safeguarded by automated tests and behavioral verifications:

```typescript
export interface VerificationQuality {
  score: number; // 0 to 100
  level: 'COMPREHENSIVE' | 'MODERATE' | 'MINIMAL' | 'NONE' | 'UNCERTAIN';
  hasUnitTests: boolean;
  hasIntegrationTests: boolean;
  hasE2ETests: boolean;
  testFileCount: number;
  verifiedFlowCount: number;
  unverifiedFlowCount: number;
  testRatio: number; // test resources / total resources
  confidence: number;
  evidence: FeatureRiskEvidence[];
}
```

---

## Scoring Formula

$$\text{Verification Score} = 50 \times \text{testRatio} + 20 \times \mathbf{1}_{\text{unit}} + 20 \times \mathbf{1}_{\text{integration}} + 10 \times \mathbf{1}_{\text{e2e}} - 10 \times \text{unverifiedFlows}$$

- **COMPREHENSIVE**: $\ge 80$
- **MODERATE**: $50–79$
- **MINIMAL**: $20–49$
- **NONE**: $< 20$
