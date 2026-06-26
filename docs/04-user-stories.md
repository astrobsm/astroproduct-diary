# Phase 1 — User Stories (selected, by module)

Format: *As a [role], I want [capability], so that [value].* Acceptance criteria abbreviated.

## Identity & Access
- As a **Super Admin**, I want to assign roles to users, so that access matches responsibility.
  - AC: role change is audit-logged; permissions update immediately on next request.
- As any **user**, I want to log in securely and stay signed in offline, so that I can work in the field.
  - AC: JWT access+refresh; cached content available without network.

## Product Knowledge
- As a **Product Manager**, I want to maintain product pages (EN/FR), so that the field always has accurate info.
  - AC: edits versioned & audit-logged; FR fields optional but flagged when missing.
- As a **Marketer**, I want to view a product's indications, contraindications, MOA, and application steps, so that I present confidently.
  - AC: content loads offline; images render; brochure downloadable.
- As an **HCP**, I want product comparison charts, so that I choose the right dressing for a wound phase.

## Research & Evidence
- As a **Medical Director**, I want references graded by evidence level with citations, so that claims are defensible.
  - AC: each reference shows source, year, DOI/URL, evidence grade.
- As a **Marketer**, I want a plain-language summary of a study, so that I can explain it to clinicians.

## LMS
- As a **Marketer**, I want an assigned learning path with quizzes, so that I become competent and certified.
  - AC: progress tracked; certificate issued on pass; re-attempts allowed per policy.
- As a **Distributor**, I want a storage & handling course, so that product integrity is maintained.

## Training of Trainers
- As a **Trainer**, I want competency assessments and badges, so that my training authority is recognized.
  - AC: assessor scores against rubric; badge awarded at threshold.

## CRM
- As a **Marketer**, I want to log visits and follow-ups per hospital/contact, so that engagement is tracked.
  - AC: interaction captured offline, synced later; follow-up reminders fire.

## Hospitals
- As an **Ops Manager**, I want to import a verified hospital registry, so that the field has reliable targets.
  - AC: import requires source + verification; rejected rows reported; no free-text fabrication.

## Campaigns & Seminars
- As a **Marketing Manager**, I want to plan campaigns and schedule seminars, so that activity is coordinated.
- As a **Marketer**, I want to record seminar attendance, leads, and samples distributed, so that ROI is measurable.

## Sales Intelligence
- As an **MD**, I want an executive dashboard of sales, training, and penetration, so that I steer the business.
- As a **Sales Officer**, I want territory performance vs target, so that I focus effort.

## AI Coach
- As a **Marketer**, I want to ask the AI Coach product/clinical questions in EN or FR, so that I learn on demand.
  - AC: answers grounded in KB + cited research; refuses to invent claims; cites sources.
