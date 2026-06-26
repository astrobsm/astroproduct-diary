# Phase 1 — Development Roadmap

Pragmatic, value-first sequencing. Each phase ends with something usable and demonstrable.

## Phase 1 — Foundation (DONE in this delivery)
- Requirements analysis & architecture (`/docs`).
- Monorepo scaffold.
- Database schema (Prisma).
- Runnable PWA shell + Product Education seeded from official documents.

## Phase 2 — Product Knowledge + Research library
- CRUD for products, sections, ingredients, FAQs, media (Product Manager).
- Bilingual (EN/FR) content editing.
- Research references + evidence grading + product linkage.
- Brochure/video upload to object storage.
- Product comparison charts.
- Public-facing (authenticated) product pages with images.

## Phase 3 — LMS + Training of Trainers
- Courses → modules → lessons → quizzes.
- Enrollment, progress tracking, pass/fail, certificates (PDF).
- Audience-specific learning paths (Exec, Marketing, Sales, Distributor, Clinical).
- TOT competencies, assessments, trainer badges.

## Phase 4 — CRM + Hospitals + Campaigns/Seminars
- Hospital import pipeline (CSV/registry) + verification workflow.
- Contacts, interactions, follow-ups, reminders.
- Campaign planning, territory mapping.
- Seminar scheduling, attendance, leads, sample distribution.

## Phase 5 — Sales Intelligence + Dashboards
- Orders, distributor management, order items.
- Territory targets, KPIs, revenue analytics.
- Executive dashboard (sales, training, campaigns, penetration).
- Stock forecasting (baseline statistical model).

## Phase 6 — AI Coach + i18n hardening + Offline
- RAG AI Coach grounded in product KB + cited research (EN/FR).
- Quiz generation & competency assessment assistance.
- Full PWA offline sync for field capture (visits, leads).
- French content parity pass.

## Phase 7 — International expansion + scale
- Multi-country onboarding (Ghana, Kenya, Rwanda, …).
- Elasticsearch search upgrade.
- Kubernetes deployment + CI/CD hardening.
- Portuguese localization groundwork.

---

## Engineering practices (all phases)
- Trunk-based dev with PR review.
- Automated tests (unit + API integration + critical E2E).
- Migrations via Prisma; no manual schema drift.
- Secrets via environment/secret manager — never committed.
- Audit logging on all write operations.
