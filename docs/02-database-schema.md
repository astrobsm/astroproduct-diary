# Phase 1 — Database Schema (PostgreSQL via Prisma)

This is the canonical data model. The Prisma schema in `apps/api/prisma/schema.prisma` mirrors this. Enums and relations are designed for bilingual content and verified-data import.

## Conventions
- All tables have `id` (cuid), `createdAt`, `updatedAt`.
- Translatable text uses a `*_translations` pattern or JSON `i18n` field keyed by locale (`en`, `fr`).
- No clinical/contact field is populated with invented data — see import pipelines.

---

## Identity & Access

```
User(id, email[unique], passwordHash, fullName, phone, locale, status, createdAt, updatedAt)
Role(id, key[unique], name)                      # SUPER_ADMIN, MD, OPS_MANAGER, MEDICAL_DIRECTOR,
                                                 # PRODUCT_MANAGER, MARKETING_MANAGER, MARKETER,
                                                 # CUSTOMER_CARE, DISTRIBUTOR, TRAINER, HCP, AUDITOR
Permission(id, key[unique], description)
UserRole(userId, roleId)                         # M:N
RolePermission(roleId, permissionId)             # M:N
AuditLog(id, userId, action, entity, entityId, metadata Json, ip, createdAt)
RefreshToken(id, userId, tokenHash, expiresAt, revokedAt)
```

## Product Knowledge

```
Product(id, slug[unique], name, category, summary, status, heroImage, i18n Json, createdAt, updatedAt)
ProductIngredient(id, productId, name, percent, role, i18n Json)
ProductSection(id, productId, type, title, body, order, i18n Json)
   # type: DESCRIPTION, INDICATIONS, CONTRAINDICATIONS, ADVANTAGES, APPLICATION,
   #       MECHANISM, STORAGE, PRECAUTIONS
ProductFAQ(id, productId, question, answer, order, i18n Json)
ProductMedia(id, productId, kind, url, caption, order)   # kind: IMAGE, VIDEO, BROCHURE
ProductComparison(id, name, productIds String[], matrix Json)
```

## Research & Evidence

```
ResearchSource(id, name, url)                    # PubMed, WHO, Cochrane, NIH, IWJ, EPUAP, NPIAP, WUWHS
ResearchReference(id, sourceId, title, authors, journal, year, doi, url,
                  evidenceLevel, summary, aiSummary, createdAt)
   # evidenceLevel: SYSTEMATIC_REVIEW, META_ANALYSIS, RCT, COHORT, CASE_SERIES,
   #                GUIDELINE, EXPERT_OPINION, COMPANY_DATA
ReferenceLink(id, referenceId, productId?, ingredientId?, topic)   # connects evidence to products
```

## Learning Management (LMS)

```
Course(id, slug, title, description, audience, level, coverImage, i18n Json, published, createdAt)
   # audience: EXECUTIVE, MARKETING, CUSTOMER_CARE, SALES, DISTRIBUTOR, CLINICAL, TOT
Module(id, courseId, title, order, i18n Json)
Lesson(id, moduleId, title, contentType, body, mediaUrl, order, i18n Json)
   # contentType: TEXT, VIDEO, PDF, INTERACTIVE
Quiz(id, lessonId?, courseId?, title, passScore)
Question(id, quizId, prompt, type, options Json, correct Json, explanation, i18n Json)
   # type: SINGLE, MULTI, TRUE_FALSE
Enrollment(id, userId, courseId, status, progressPct, startedAt, completedAt)
QuizAttempt(id, userId, quizId, score, passed, answers Json, createdAt)
Certificate(id, userId, courseId, serial[unique], issuedAt, pdfUrl)
```

## Training of Trainers (TOT)

```
Competency(id, key, name, description, rubric Json)
   # PRESENTATION, PUBLIC_SPEAKING, SEMINAR_ORG, AUDIENCE_ENGAGEMENT,
   # WORKSHOP_FACILITATION, CME_DEVELOPMENT
TrainerProfile(id, userId[unique], status, bio)
CompetencyAssessment(id, trainerProfileId, competencyId, score, assessorId, notes, createdAt)
TrainerBadge(id, trainerProfileId, badgeKey, awardedAt)
```

## Hospitals / Geography

```
Country(id, iso2, name, language)                # NG, GH, KE, RW, UG, TZ, CM, ZM, BW, NA, ZA, SN, CI
GeopoliticalZone(id, countryId, name)            # NG: NORTH_CENTRAL, NORTH_EAST, NORTH_WEST,
                                                 #     SOUTH_EAST, SOUTH_SOUTH, SOUTH_WEST
StateRegion(id, countryId, zoneId?, name, code)
Lga(id, stateId, name)                           # NG local government areas
Facility(id, countryId, stateId?, lgaId?, zoneId?, name, type, address,
         latitude, longitude, phone, email, website, source, verifiedAt, createdAt)
   # type: FEDERAL, TEACHING, SPECIALIST, GENERAL, MISSION, PRIVATE, PRIMARY
FacilityContact(id, facilityId, contactId)       # link to CRM Contact
ImportBatch(id, entity, sourceFile, rows, accepted, rejected, createdById, createdAt)
```

> **Import-only rule:** `Facility` rows are created exclusively through `ImportBatch` from verified registries; the UI exposes no free-text "invent a hospital" path without a source + `verifiedAt`.

## CRM

```
Contact(id, facilityId?, fullName, title, role, phone, email, consentAt, i18n Json)
   # role: DOCTOR, NURSE, PHARMACIST, PROCUREMENT, ADMIN, DISTRIBUTOR_REP
Interaction(id, contactId?, facilityId?, userId, type, channel, notes, occurredAt)
   # type: CALL, VISIT, MEETING, EMAIL, SEMINAR
FollowUp(id, interactionId?, contactId?, assigneeId, dueAt, status, notes)
```

## Campaigns & Seminars

```
Campaign(id, name, ownerId, territory, startDate, endDate, status, objectives Json)
Seminar(id, campaignId?, title, type, facilityId?, venue, scheduledAt, organizerId, status)
   # type: CME, WORKSHOP, PRODUCT_LAUNCH
SeminarAttendee(id, seminarId, contactId?, name, role, signedInAt)
Lead(id, seminarId?, campaignId?, contactId?, source, stage, value, ownerId, createdAt)
   # stage: NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST
SampleDistribution(id, seminarId?, campaignId?, productId, quantity, recipientContactId?, userId, givenAt)
```

## Sales Intelligence

```
Distributor(id, name, contactId?, territory, tier, status)
Order(id, distributorId?, facilityId?, ownerId, status, currency, total, placedAt)
   # status: DRAFT, CONFIRMED, FULFILLED, CANCELLED
OrderItem(id, orderId, productId, quantity, unitPrice, lineTotal)
TerritoryTarget(id, territory, period, targetValue, productId?)
StockForecast(id, productId, territory, period, projectedDemand, basisJson)
```

## Read models (analytics)
Materialized views / scheduled rollups for: monthly sales, regional sales, product performance, training completion, campaign status, market penetration. Built in Phase 5.

---

## Entity-relationship highlights

```
User ─< UserRole >─ Role ─< RolePermission >─ Permission
Product ─< ProductSection / ProductIngredient / ProductFAQ / ProductMedia
ResearchReference ─< ReferenceLink >─ Product / ProductIngredient
Course ─< Module ─< Lesson ─< Quiz ─< Question
User ─< Enrollment >─ Course ;  User ─< Certificate >─ Course
Country ─< StateRegion ─< Lga ;  Country ─< GeopoliticalZone
Facility ─< FacilityContact >─ Contact ─< Interaction
Campaign ─< Seminar ─< SeminarAttendee ;  Seminar ─< Lead
Distributor ─< Order ─< OrderItem >─ Product
```
