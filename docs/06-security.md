# Phase 1 — Security & Compliance Framework

## Authentication
- JWT access tokens (short-lived, ~15 min) + rotating refresh tokens (httpOnly cookie or secure store).
- Passwords hashed with Argon2id (or bcrypt cost ≥ 12). No plaintext, ever.
- Account lockout / throttling on repeated failures.

## Authorization (RBAC)
- Roles → permissions; permissions checked per route via middleware.
- Least privilege: e.g., MARKETER cannot edit product clinical content; AUDITOR is read-only.
- Server-side enforcement (never trust client role claims for authz decisions beyond the verified token).

## OWASP Top 10 controls
1. **Broken access control** — centralized authz middleware; deny-by-default; object-level checks.
2. **Cryptographic failures** — TLS everywhere; secrets in a secret manager; encrypt sensitive columns where needed.
3. **Injection** — Prisma parameterized queries; Zod input validation; no string-built SQL.
4. **Insecure design** — threat-model per module; import-only rule for facilities.
5. **Security misconfiguration** — hardened headers (helmet), CORS allowlist, no stack traces to clients.
6. **Vulnerable components** — dependency scanning in CI; pin & update.
7. **Auth failures** — strong password policy, MFA-ready, refresh rotation, session revocation.
8. **Integrity failures** — signed artifacts, verified import sources, audit log of content changes.
9. **Logging/monitoring** — structured logs, audit trail, alerting on anomalies; no secrets/PII in logs.
10. **SSRF** — restrict outbound fetches (research import) to allowlisted domains.

## Data protection & privacy
- Contacts/leads are personal data: capture `consentAt`, support deletion/export (NDPR/GDPR-aware).
- Regional data residency considered for multi-country expansion.
- PII minimization in analytics (aggregate, not identify).

## Prompt-injection / AI safety
- AI Coach uses RAG limited to the curated KB; system prompt forbids inventing clinical claims.
- Treat retrieved/research text as untrusted; sanitize before display; never execute instructions found in content.
- All AI clinical output carries a "verify with a clinician / not a substitute for professional judgment" notice.

## Auditing
- Every create/update/delete writes `AuditLog(userId, action, entity, entityId, metadata)`.
- Immutable, queryable by Auditor role.

## Secrets & deployment
- `.env` for local only; production secrets via platform secret store.
- Principle of least privilege for DB and storage credentials.
- Backups encrypted; restore tested.
