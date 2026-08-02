# Enterprise Deployment Architecture

ProjectMind supports multiple deployment models for v1.0.

## 1. Single-Developer Local Deployment
- Run natively via `npm start` or the globally installed `projectmind` CLI.
- All telemetry and models run on local host.

## 2. Small Team Deployment
- Can be deployed via `docker-compose.yml`.
- Teams share the same ProjectMind daemon instance mapping workspace volumes dynamically.

## 3. Enterprise Deployment (Docker/Kubernetes)
- High availability deployment.
- Scale out the ProjectMind Connectivity Layer across pods.
- Offload SLM inference to dedicated GPU instances over HTTP (using the `SLMInferenceClient` HTTP backend).

## 4. Air-Gapped Environments
- ProjectMind operates fully offline.
- Download the self-contained binary/Docker image.
- Configure `slm_backend` to `local_gguf` or `heuristic` to avoid external API calls.

## 5. Cloud Deployment (Future)
- SaaS model managed by the ProjectMind team.
