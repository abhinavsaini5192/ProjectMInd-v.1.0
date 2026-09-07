# Data Flow & Transformations

## Overview

Data flow analysis tracks how information enters a feature, moves across components, undergoes schema transformations, and exits the feature.

---

## Transformation Pipeline

```
[LoginRequestDto] 
       ↓ (TRANSFORMS)
[ValidatedCredentials] 
       ↓ (TRANSFORMS)
[UserEntity] 
       ↓ (TRANSFORMS)
[JwtTokenPayload] 
       ↓ (TRANSFORMS)
[AuthResponseDto]
```

---

## Security & Secret Sanitization

> [!WARNING]
> **Data flows track field names and data types, NEVER raw values.**
> Under no circumstances does ProjectMind store passwords, API keys, private tokens, or session IDs in behavioral models.

1. All labels and metadata strings are processed through `SecuritySanitizer.redactSecrets`.
2. Password assignments, JWT tokens, AWS access keys, and bearer tokens are replaced with `[REDACTED_SECRET]`, `[REDACTED_JWT_TOKEN]`, or `[REDACTED_AWS_KEY]`.
3. Transformations focus on entity structural changes rather than data values.
