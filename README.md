# ASTROBSM Academy & Sales Intelligence Platform

Enterprise education, training, CRM, and sales-intelligence platform for **Bonnesante Medicals (ASTROBSM)** — a Nigerian advanced wound-care manufacturer expanding across Sub-Saharan Africa (English & French speaking).

> Wound care, our passion.

---

## What this repository contains

This is a **monorepo** delivered in phases. The current state delivers:

- **Phase 1** — Enterprise requirements analysis & system architecture (`/docs`)
- **Foundation** — A runnable React + TypeScript + Tailwind Progressive Web App (`/apps/web`) seeded with real product education content extracted from the official ASTROBSM product documents.
- **Backend scaffold** — Node + Express + TypeScript + Prisma (PostgreSQL) schema covering products, research, LMS, CRM, hospitals, campaigns, and sales (`/apps/api`).
- **Shared types** — Cross-package TypeScript contracts (`/packages/shared`).

## Repository layout

```
ASTROBSM-PRODUCT-DIARY/
├─ docs/                     # Phase 1 deliverables (architecture, schema, roadmap, etc.)
│  ├─ 01-architecture.md
│  ├─ 02-database-schema.md
│  ├─ 03-roadmap.md
│  ├─ 04-user-stories.md
│  ├─ 05-api-spec.md
│  └─ 06-security.md
├─ apps/
│  ├─ web/                   # React + TS + Tailwind PWA (runs today)
│  └─ api/                   # Node + Express + Prisma scaffold
├─ packages/
│  └─ shared/                # Shared domain types
└─ README.md
```

## Quick start (web app)

```powershell
cd apps/web
npm install
npm run dev
```

Then open the URL printed in the terminal (default http://localhost:5173).

## Data-integrity policy (important)

This platform serves clinical and commercial decisions. Therefore:

- **No invented clinical claims.** Product education content is sourced from official ASTROBSM documents and clearly cited references.
- **No fabricated contact data.** Hospital records, phone numbers, and addresses must be imported from verified registries (e.g., Federal Ministry of Health facility registry) via the import pipeline — never hand-typed guesses.
- **Evidence grading.** Research entries carry source + evidence level so trainers can distinguish marketing copy from peer-reviewed evidence.

See [`docs/01-architecture.md`](docs/01-architecture.md) to begin.
