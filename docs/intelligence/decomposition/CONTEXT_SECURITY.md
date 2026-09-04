# Context Security & Untrusted Data Containment

## Defenses
1. **Data vs Instruction Framing**: All repository contents are framed as untrusted data using `<repository-data resource="...">...</repository-data>`. Prompt injection attempts inside source comments cannot hijack system instructions.
2. **Secret Scrubbing**: AWS access keys, JWT bearer tokens, and passwords/credentials are automatically redacted before context selection.
3. **Controlled Knowledge Boundary**: The SLM has zero direct filesystem, git, or database scanning privileges.
