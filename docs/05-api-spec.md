# Phase 1 — API Specification (v1 outline)

Base URL: `/api/v1`. Auth: `Authorization: Bearer <accessToken>`. Content negotiation: `Accept-Language: en|fr`.
All list endpoints support `?page`, `?pageSize`, `?q` (search), and return `{ data, meta }`.

## Auth
```
POST   /auth/register            # admin-created users
POST   /auth/login               -> { accessToken, refreshToken, user }
POST   /auth/refresh             -> { accessToken }
POST   /auth/logout
GET    /auth/me                  -> current user + roles + permissions
```

## Products
```
GET    /products                 # list (filter: category, status)
GET    /products/:slug           # full product with sections, ingredients, faqs, media
POST   /products                 # PRODUCT_MANAGER
PUT    /products/:id
DELETE /products/:id
POST   /products/:id/media       # upload image/video/brochure (multipart)
GET    /product-comparisons/:id
```

## Research
```
GET    /research                 # filter: source, evidenceLevel, productId
GET    /research/:id
POST   /research                 # MEDICAL_DIRECTOR / PRODUCT_MANAGER
POST   /research/:id/summary     # request AI plain-language summary (grounded)
```

## LMS
```
GET    /courses                  # filter: audience, level, published
GET    /courses/:slug            # modules + lessons
POST   /enrollments              # { courseId }
GET    /enrollments/me
POST   /quizzes/:id/attempts     # { answers } -> score, passed
GET    /certificates/me
```

## TOT
```
GET    /tot/competencies
POST   /tot/assessments          # TRAINER assessor
GET    /tot/trainers/:userId
```

## CRM
```
GET    /contacts                 # filter: facilityId, role
POST   /contacts
POST   /interactions             # supports offline sync (clientId, occurredAt)
GET    /followups/me
PATCH  /followups/:id            # status update
```

## Hospitals
```
GET    /facilities               # filter: countryId, zoneId, stateId, type; geo bbox
GET    /facilities/:id
POST   /imports/facilities       # multipart CSV; returns ImportBatch summary
GET    /imports/:id              # batch status, accepted/rejected
```

## Campaigns & Seminars
```
GET    /campaigns
POST   /campaigns
GET    /seminars
POST   /seminars
POST   /seminars/:id/attendees
POST   /leads
POST   /samples
```

## Sales
```
GET    /orders                   # filter: distributorId, status, period
POST   /orders
GET    /distributors
GET    /analytics/sales          # rollups: monthly, regional, product
GET    /analytics/dashboard      # executive summary
```

## AI Coach
```
POST   /ai/coach                 # { message, locale, context? } -> grounded answer + citations
POST   /ai/quiz                  # { topic, count } -> generated questions (review required)
```

### Conventions
- Validation: request bodies validated (Zod) at the boundary; 422 on failure.
- Errors: `{ error: { code, message, details? } }`.
- Pagination meta: `{ page, pageSize, total }`.
- Idempotency for offline sync: client supplies `clientId`; server dedupes.
