# PRD: Self-Hosted Infrastructure — Hetzner + Coolify Mothership

## Product overview

### Document title and version

**PRD: Self-Hosted Infrastructure — Hetzner + Coolify Mothership**
Version 1.0 — April 2026

### Product summary

Joseph Winke operates a growing portfolio of SvelteKit SaaS projects built on the JST template (Meadow Medicine, Flush, and additional future clients). These apps currently run on Cloudflare Pages with Supabase-managed databases. As the portfolio scales, the per-project cost of Supabase and the constraints of Cloudflare Pages create both financial and architectural friction.

This document specifies the infrastructure required to migrate to a fully self-hosted stack: a Hetzner VPS running Coolify as the deployment platform, with Docker-containerized SvelteKit apps, per-project Postgres instances, a shared MinIO object storage service, and Tailscale for secure internal networking. The result is a predictable, low-cost hosting platform that Joseph fully controls and can extend to new client projects at near-zero marginal cost.

The JAT IDE toolchain already runs on a separate Hetzner/Tailscale node. This infrastructure sits alongside that node and is managed independently.

---

## Goals

### Business goals

- Reduce per-project hosting cost from ~$25–50/month (Supabase Pro) to near-zero marginal cost for each additional project on existing hardware.
- Eliminate Cloudflare Pages adapter lock-in — all JST projects move to `adapter-node` with Docker.
- Provide a single control plane (Coolify) for deployments, environment variables, logs, and health checks across all projects.
- New client project onboarding: provision one Postgres database and add one Coolify service — no new vendor accounts.

### User goals

- Deploy any JST project by pushing to `main`; Coolify handles build, container swap, and health check with no manual SSH.
- View logs, restart containers, roll back, and manage env vars from one UI at `coolify.jwinke.com`.
- Verify database backups completed without leaving the terminal.

### Non-goals

- Application code changes — separate project PRDs.
- Per-project data migration from Supabase — separate migration PRDs.
- Multi-region deployment, Kubernetes, or HA Postgres clustering.
- CI pipelines beyond Coolify's built-in build trigger.

---

## User personas

### Joseph Winke — solo developer and infrastructure operator

Full root access via SSH over Tailscale. Admin access to Coolify UI. Superuser on all Postgres instances.

Key workflows: provisioning new projects, pushing code, viewing logs, rolling back, checking backups, monitoring disk/memory.

Pain points with current setup: env vars scattered across CF/Supabase dashboards, Supabase Free pauses after inactivity, no centralized log view.

---

## Functional requirements

### Server provisioning

**SR-001 (P0)** — Hetzner CPX21 (3 vCPU, 4 GB RAM, 80 GB NVMe, ~€7.49/month) as minimum viable mothership for up to 3 production projects.

**SR-002 (P0)** — Support online resize to CPX31 (4 vCPU, 8 GB RAM) without data loss.

**SR-003 (P0)** — Ubuntu 24.04 LTS.

**SR-004 (P0)** — Hetzner Firewall: only ports 22, 80, 443 from public internet. All others blocked.

**SR-005 (P0)** — SSH: key-based only, password auth disabled.

**SR-006 (P1)** — Separate Hetzner CPX11 (~€3.49/month) for shared dev/staging instances.

### Coolify installation

**CR-001 (P0)** — Coolify installed via official script, accessible at `coolify.jwinke.com`.

**CR-002 (P0)** — Valid SSL certificate (Let's Encrypt via Caddy).

**CR-003 (P0)** — Coolify UI accessible only from Tailscale IP — not public internet.

**CR-004 (P0)** — Coolify manages all app containers, Postgres containers, and MinIO via Docker Compose resources.

**CR-005 (P1)** — GitHub integration: push to configured branch triggers automatic build and deploy.

**CR-006 (P1)** — Read-only team members scoped to individual projects.

**CR-007 (P1)** — Coolify data (`/data/coolify`) included in weekly Hetzner snapshot.

**CR-008 (P2)** — Deploy success/failure notifications to Discord webhook.

### Tailscale network

**TS-001 (P0)** — Mothership joins existing tailnet as `coolify-prod`.

**TS-002 (P0)** — Dev server joins as `coolify-dev` (if provisioned).

**TS-003 (P0)** — All Postgres instances bind only to Docker bridge and Tailscale interface. Port 5432 blocked from public internet.

**TS-004 (P0)** — App containers connect to Postgres via Docker internal network (same host) or Tailscale IP (cross-host).

**TS-005 (P1)** — Coolify UI (port 8000/443) restricted to Tailscale IPs.

**TS-006 (P2)** — Tailscale ACL rules documented for JAT IDE ↔ Coolify mothership communication.

### Application setup

**APP-001 (P0)** — Each JST project has a `Dockerfile` using `adapter-node` + Bun, buildable by Coolify without additional tooling.

**APP-002 (P0)** — All environment variables defined in Coolify environment manager — never in the repository.

**APP-003 (P0)** — App containers expose port 3000 internally; Coolify/Caddy routes public domain to this port.

**APP-004 (P0)** — Health check endpoint `GET /health` returns HTTP 200; configured as Docker health check.

**APP-005 (P1)** — Zero-downtime deploys: new container must pass health check before old is removed.

**APP-006 (P1)** — One-click rollback to previous Docker image in Coolify UI without full rebuild.

**APP-007 (P1)** — Separate Coolify services for production and dev/staging per project.

**APP-008 (P2)** — BuildKit layer cache configured to reduce incremental build times.

### Postgres provisioning

**PG-001 (P0)** — Dedicated Postgres 16 container per production project, data on named Docker volume.

**PG-002 (P0)** — Strong random `POSTGRES_PASSWORD` in Coolify secret store — never in repo.

**PG-003 (P0)** — Postgres containers publish no ports to host network.

**PG-004 (P1)** — Dev/staging uses separate database from production.

**PG-005 (P1)** — `max_connections = 100`, `shared_buffers = 256MB` on CPX21, tunable via env vars.

**PG-006 (P2)** — PgBouncer provisionable per-project when needed.

### MinIO object storage

**MIO-001 (P0)** — Single MinIO instance as Coolify service on mothership, accessible via Docker bridge.

**MIO-002 (P0)** — Per-project bucket (e.g., `meadow-prod`, `flush-prod`) with scoped IAM access keys.

**MIO-003 (P0)** — MinIO admin console accessible via Tailscale only.

**MIO-004 (P1)** — S3-compatible endpoint usable as drop-in for Supabase Storage.

**MIO-005 (P1)** — MinIO data volume included in backup strategy.

**MIO-006 (P2)** — Public-read buckets proxied through Caddy with cache headers.

### Backup strategy

**BK-001 (P0)** — RPO: no more than 24 hours of data loss for any production database.

**BK-002 (P0)** — RTO: restorable and application reachable within 2 hours of declared incident.

**BK-003 (P0)** — `pg_dump` cron nightly at 02:00 UTC per production database → compressed `.sql.gz` → uploaded to `backups` MinIO bucket.

**BK-004 (P0)** — Hetzner snapshot schedule: weekly (Sundays), minimum 3 snapshots retained.

**BK-005 (P1)** — Backup jobs write success/failure to log; alert Joseph if backup not completed within 26 hours.

**BK-006 (P1)** — Backup restore tested manually before first production cutover.

**BK-007 (P2)** — MinIO bucket versioning enabled for `backups` bucket.

**BK-008 (P2)** — Dumps older than 30 days auto-deleted by MinIO lifecycle policy.

### Monitoring and alerting

**MON-001 (P0)** — Coolify health checks restart containers failing 3 consecutive checks.

**MON-002 (P1)** — External uptime monitor (UptimeRobot free tier) on all production domains; alert within 5 minutes of downtime.

**MON-003 (P1)** — Alert when disk > 80% or RAM > 90% for 10+ minutes.

**MON-004 (P1)** — Coolify deploy notifications (success/failure) to configured channel.

**MON-005 (P2)** — Container logs in Coolify UI with 7-day retention.

**MON-006 (P2)** — Per-container CPU/memory graphs via Netdata or cAdvisor.

### Deployment flow

**DEP-001 (P0)** — Push to production branch → automatic Coolify build and deploy via GitHub webhook.

**DEP-002 (P0)** — Coolify builds image, starts container, verifies health check, swaps traffic — no manual intervention.

**DEP-003 (P1)** — Health check failure on new deploy: Coolify stops new container, keeps old running.

**DEP-004 (P1)** — Manual deploy from Coolify UI supported for hotfixes.

**DEP-005 (P1)** — One-click rollback restores previous image within 60 seconds.

**DEP-006 (P2)** — Real-time build and deploy logs in Coolify UI.

### DNS and SSL

**DNS-001 (P0)** — Production domain A records point to Hetzner IP, managed in Cloudflare DNS.

**DNS-002 (P0)** — Coolify provisions and renews SSL via Let's Encrypt (ACME HTTP-01).

**DNS-003 (P0)** — `coolify.jwinke.com` resolves to Tailscale IP (not public IP).

**DNS-004 (P1)** — Caddy redirects HTTP → HTTPS for all domains.

**DNS-005 (P2)** — Cloudflare proxy (orange cloud) re-enabled per-domain after cutover with SSL mode "Full (strict)".

### Migration and cutover

**MIG-001 (P0)** — Cloudflare Pages deployment remains live during migration; parallel operation for 48+ hours before DNS cutover.

**MIG-002 (P0)** — Self-hosted deployment accessible via temporary subdomain for smoke testing before primary domain is cut over.

**MIG-003 (P1)** — DNS TTL set to 60 seconds 24 hours before cutover.

**MIG-004 (P1)** — Rollback to Cloudflare Pages achievable within 5 minutes by updating the A record.

**MIG-005 (P1)** — All environment variables catalogued from CF Pages + Supabase before migration and re-entered in Coolify.

**MIG-006 (P2)** — After DNS cutover, CF Pages disabled (not deleted) for 30-day observation period.

---

## Architecture

```
PUBLIC INTERNET
      │  ports 80, 443 only
      ▼
┌──────────────────────────────────────────────────┐
│  Hetzner CPX21  (coolify-prod, ~€7.49/mo)        │
│                                                  │
│  Caddy (managed by Coolify)                      │
│    coolify.jwinke.com  → [Tailscale only]        │
│    meadow.clinic       → meadow-app:3000         │
│    flushapp.com        → flush-app:3000          │
│                                                  │
│  Docker bridge network                           │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │ meadow-app │  │ flush-app  │  │   MinIO   │  │
│  │ :3000      │  │ :3000      │  │ (shared)  │  │
│  └─────┬──────┘  └─────┬──────┘  └───────────┘  │
│        │               │                         │
│  ┌─────▼──────┐  ┌─────▼──────┐  ┌───────────┐  │
│  │ meadow-pg  │  │  flush-pg  │  │  Coolify  │  │
│  │ postgres16 │  │ postgres16 │  │  :8000    │  │
│  │ (no ports) │  │ (no ports) │  │ [TS only] │  │
│  └────────────┘  └────────────┘  └───────────┘  │
│                                                  │
│  tailscale0  (100.x.x.x)                        │
└──────────────────────────────────────────────────┘
           │ Tailscale network
┌──────────┴──────────────────────────────────────┐
│  coolify-prod  (100.x.x.2)                      │
│  coolify-dev   (100.x.x.3) [CPX11, optional]    │
│  jat-node      (existing JAT IDE)               │
│  joseph-laptop                                  │
└─────────────────────────────────────────────────┘
```

```
DEPLOYMENT FLOW

  git push origin main
        │
        ▼ GitHub webhook
  Coolify → Docker build (BuildKit cache)
        │
        ▼
  New container starts (old still running)
        │
  GET /health ──── fail 3x ──→ keep old, alert Joseph
        │ pass
        ▼
  Caddy routes to new container
  Old container stopped
  Discord: "deployed ✓"
```

```
BACKUP FLOW (nightly 02:00 UTC)

  cron → pg_dump {project} → .sql.gz
       → verify size > 1KB
       → mc cp → minio/backups/{project}/{date}/db.sql.gz
       → success: log OK
       → failure: webhook alert to Joseph
```

---

## Cost model

| Scenario | Server | Monthly cost |
|----------|--------|--------------|
| 1–3 projects, no dev | CPX21 | ~€10 |
| 1–3 projects + dev | CPX21 + CPX11 | ~€14 |
| 4–7 projects + dev | CPX31 + CPX11 | ~€20 |
| 8–12 projects + dev | CPX51 + CPX21 | ~€58 |

Supabase Pro comparison: 3 projects = ~$75/month (~€69). Self-hosted 3 projects = ~€14/month. Savings grow linearly with project count.

---

## Milestones

### Phase 1 — Mothership provisioning (days 1–2)
Provision CPX21. Hetzner Firewall. Ubuntu 24.04. Harden SSH. Install Tailscale, join tailnet. Install Coolify. Configure `coolify.jwinke.com` → Tailscale IP only.

### Phase 2 — Core services (days 2–3)
Deploy MinIO via Coolify. Create buckets. Deploy first test Postgres container. Verify Docker internal networking. Configure backup cron; run first manual backup → verify dump in MinIO.

### Phase 3 — First project on staging (days 3–5)
Add `Dockerfile` to project repo. Create Coolify service. Set env vars. Configure GitHub webhook. Push test commit; watch build-deploy cycle. Smoke test on temporary subdomain. Verify health check, logs, rollback.

### Phase 4 — Monitoring hardening (days 5–6)
Nightly backup cron for all databases. UptimeRobot monitors. Coolify deploy notifications. Test backup restore. Document restore procedure.

### Phase 5 — DNS cutover for first project (days 6–7)
Set CF TTL to 60s (24h before). Update A record. Monitor 48h. Disable CF Pages deployment. Repeat for each subsequent project.

### Phase 6 — Dev server (days 7–8, optional)
Provision CPX11. Tailscale join. Dev-branch deployments for all projects.

---

## Success metrics

- `git push` to live traffic in under 5 minutes
- One-click rollback in under 60 seconds
- New project provisioned (Postgres + Coolify + DNS) in under 30 minutes
- Zero production incidents from backup failure in first 90 days
- Monthly infrastructure cost under €14 for 1–3 projects
- Zero Supabase Pro subscriptions after full migration

---

## User stories (26 stories covering all functional requirements)

US-001: Provision and harden mothership
US-002: Join Tailscale tailnet
US-003: Install Coolify, restrict to Tailscale
US-004: GitHub integration for auto-deploys
US-005: Per-project Postgres container
US-006: Deploy SvelteKit project as Docker container
US-007: Zero-downtime deployment
US-008: Automatic rollback on failed health check
US-009: One-click rollback in under 60 seconds
US-010: Automatic SSL provisioning and renewal
US-011: Env var management through Coolify UI
US-012: Shared MinIO with per-project bucket isolation
US-013: Nightly pg_dump to MinIO
US-014: Backup restoration test before cutover
US-015: Weekly Hetzner snapshots
US-016: Container health monitoring and auto-restart
US-017: External uptime monitoring
US-018: Disk and memory alerting
US-019: Live build and application logs in Coolify
US-020: Dev/staging instances on shared dev server
US-021: DNS cutover with minimal downtime and rollback
US-022: Parallel operation during migration window
US-023: New project provisioned in under 30 minutes
US-024: Coolify API access over Tailscale for JAT automation
US-025: Server upgrade (CPX21 → CPX31) without data loss
US-026: Secure Coolify UI access with strong password + Tailscale
