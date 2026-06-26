# Phase 1 — Enterprise Requirements Analysis & System Architecture

**System name:** ASTROBSM Academy & Sales Intelligence Platform
**Owner:** Bonnesante Medicals (ASTROBSM), Enugu, Nigeria
**Document status:** Phase 1 baseline (living document)

---

## 1. Business context

Bonnesante Medicals manufactures and distributes advanced wound-care products (Hera Wound Gel, Wound-Care Honey Gauze, Wound-Clex solution, and a growing line). Growth depends on a field force of marketers who run wound-care seminars (CME-style) to educate doctors and nurses, and on distributors who move product. The company is expanding from Nigeria into English- and French-speaking Sub-Saharan markets.

### Core problem
Knowledge (clinical evidence, product mechanism, application technique, objection handling) lives in slide decks and people's heads. There is no single source of truth, no measurable training, and no structured CRM/sales pipeline linking seminars → leads → orders.

### Vision
One integrated, bilingual (EN/FR), offline-capable platform that is the **single knowledge repository** and the **operational backbone** for education, training-of-trainers, CRM, and sales intelligence.

---

## 2. Stakeholders & primary goals

| Stakeholder | Primary goal |
|---|---|
| Managing Director / Exec | Visibility into sales, training, market penetration |
| Product Manager | Maintain authoritative product knowledge & evidence |
| Marketing Manager | Plan campaigns, schedule seminars, track ROI |
| Marketer / Sales Rep | Learn products, run seminars, log leads & visits |
| Trainer (TOT) | Deliver certified training, assess competency |
| Distributor | Learn handling/storage, place & track orders |
| Healthcare Professional | Learn correct product selection & application |
| Customer Care | Support enquiries with accurate product info |
| Auditor | Read-only review of activity & compliance |

---

## 3. Scope (MoSCoW)

### Must have (MVP → Phase 2/3)
- Product Education module (image, indications, contraindications, MOA, application, FAQ, brochures).
- Research Knowledge library with evidence grading and citations.
- LMS with courses, lessons, quizzes, completion tracking, certificates.
- Training-of-Trainers (TOT) module with competency scoring + trainer badges.
- RBAC across all roles.
- Bilingual EN/FR content framework (i18n).
- Hospital database schema + import pipeline (no fabricated data).
- CRM (hospitals, contacts, interactions, follow-ups).
- Campaign & seminar management.
- Sales/order tracking + executive dashboard.
- PWA offline-first.

### Should have
- AI Coach (quiz generation, Q&A grounded in the knowledge base).
- Sales forecasting analytics.
- Sample-distribution tracking.

### Could have
- Voice assistant, Portuguese localization, native mobile shells.

### Won't have (this release)
- Full e-commerce checkout / payment processing.
- Regulatory submission management.

---

## 4. Architecture overview

A modular monolith API (clean module boundaries, single deployable) fronted by a PWA, designed so modules can later be split into services. This is the pragmatic path for a growing company — avoids premature microservice complexity while keeping seams clean.

```
                ┌──────────────────────────────────────────────┐
                │                Clients                        │
                │  PWA (web/Android/iOS via PWA) — offline-first │
                └───────────────┬──────────────────────────────┘
                                │ HTTPS / JSON (REST), JWT
                ┌───────────────▼──────────────────────────────┐
                │             API Gateway (Express)             │
                │   AuthN/AuthZ • Rate limit • Validation • i18n │
                └───┬───────┬───────┬───────┬───────┬───────────┘
       ┌────────────┘       │       │       │       └────────────┐
 ┌─────▼─────┐ ┌────────────▼─┐ ┌───▼─────┐ ┌▼──────────┐ ┌──────▼──────┐
 │ Products  │ │  Research    │ │  LMS    │ │   CRM     │ │   Sales     │
 │ module    │ │  /Evidence   │ │ /TOT    │ │ /Campaign │ │ /Analytics  │
 └─────┬─────┘ └──────┬───────┘ └────┬────┘ └─────┬─────┘ └──────┬──────┘
       └──────────────┴──────┬───────┴────────────┴───────┬──────┘
                    ┌─────────▼─────────┐         ┌────────▼─────────┐
                    │   PostgreSQL      │         │  Object storage  │
                    │  (Prisma ORM)     │         │ (S3-compatible)  │
                    └─────────┬─────────┘         └──────────────────┘
                    ┌─────────▼─────────┐         ┌──────────────────┐
                    │  Search index     │         │   AI provider    │
                    │ (Postgres FTS →   │         │ (OpenAI-compat)  │
                    │  Elasticsearch)   │         │  RAG over KB     │
                    └───────────────────┘         └──────────────────┘
```

### Key decisions
- **Modular monolith first.** Clear module boundaries (`products`, `research`, `lms`, `crm`, `campaigns`, `sales`, `hospitals`, `identity`). Split to services only when load/teams demand it.
- **Search:** start with PostgreSQL full-text search; upgrade to Elasticsearch when corpus/scale warrants. Schema designed to allow both.
- **AI:** Retrieval-Augmented Generation grounded **only** in the curated knowledge base + cited research, so the AI Coach cannot invent clinical claims.
- **Offline-first:** PWA + IndexedDB cache of product/course content; sync queue for field data (visits, leads) captured without connectivity.
- **i18n:** every user-facing string and content record is translatable (EN baseline, FR parallel).

---

## 5. Technology stack

| Layer | Choice | Rationale |
|---|---|---|
| Web | React + TypeScript + Vite | Fast DX, strong typing |
| Styling/UI | Tailwind CSS + shadcn/ui pattern | Consistent, accessible components |
| State/data | TanStack Query + Zustand | Server cache + light client state |
| Offline | PWA (service worker) + IndexedDB (Dexie) | Field use without network |
| i18n | i18next | Mature EN/FR localization |
| API | Node.js + Express + TypeScript | Team familiarity, ecosystem |
| ORM/DB | Prisma + PostgreSQL | Type-safe schema & migrations |
| Auth | JWT (access+refresh) + RBAC | Stateless, role-driven |
| Files | S3-compatible storage | Brochures, videos, product images |
| AI | OpenAI-compatible API + RAG | Grounded coaching/Q&A |
| Search | Postgres FTS → Elasticsearch | Evolve with scale |
| Deploy | Docker → Kubernetes, CI/CD | Reproducible, scalable |

---

## 6. Domain model (bounded contexts)

1. **Identity & Access** — users, roles, permissions, audit log.
2. **Product Knowledge** — products, ingredients, indications, MOA, FAQs, media.
3. **Research & Evidence** — references, summaries, evidence grade, links to products/ingredients.
4. **Learning (LMS)** — courses, modules, lessons, quizzes, enrollments, progress, certificates.
5. **Training of Trainers** — trainer competencies, badges, assessment rubrics.
6. **CRM** — hospitals (facilities), contacts, interactions, follow-ups.
7. **Hospitals/Geography** — facility registry, geopolitical zones, LGAs, countries.
8. **Campaigns & Seminars** — campaigns, seminars, attendance, leads, samples.
9. **Sales** — orders, distributors, products sold, territory performance.
10. **Analytics/Dashboards** — read models aggregating the above.

See [`02-database-schema.md`](02-database-schema.md) for the concrete schema.

---

## 7. Non-functional requirements

- **Security:** OWASP Top 10 controls, encrypted secrets, least-privilege RBAC, full audit trail. See [`06-security.md`](06-security.md).
- **Privacy:** Contacts are personal data — consent tracking, regional data-handling notes (NDPR/GDPR-aware).
- **Availability:** stateless API + managed Postgres; target 99.5% MVP.
- **Performance:** product/course reads served from cache; p95 < 300ms for reads.
- **Accessibility:** WCAG 2.1 AA for training content.
- **Localization:** EN + FR at launch; content model ready for PT.
- **Offline:** core education + field capture work without connectivity.

---

## 8. Delivery phases (summary)

| Phase | Theme | Outcome |
|---|---|---|
| 1 | Architecture & requirements | This doc set + runnable foundation |
| 2 | Product Knowledge + Research library | Authoritative bilingual product pages, evidence library |
| 3 | LMS + TOT | Courses, quizzes, certificates, trainer badges |
| 4 | CRM + Hospitals + Campaigns/Seminars | Field operations & engagement |
| 5 | Sales Intelligence + Dashboards | Orders, KPIs, forecasting |
| 6 | AI Coach + i18n hardening + PWA/offline | Bilingual AI coaching, offline sync |
| 7 | International expansion + scale (ES/K8s) | Multi-country rollout |

Full breakdown in [`03-roadmap.md`](03-roadmap.md).
