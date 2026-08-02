# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| 0.x     | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in ProjectMind, please do NOT report it via public issues.
Contact the security team at security@projectmind.dev.

We will acknowledge your report within 48 hours.

## Plugin Security

ProjectMind plugins are sandboxed by default. The `SecurityManager` enforces permission checks on:
- Global filesystem access
- Unbounded network requests
- Access to raw credentials in memory
