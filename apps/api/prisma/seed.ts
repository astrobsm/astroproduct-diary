/**
 * Prisma seed — populates a PostgreSQL database with the same official content
 * the in-memory development store uses. Idempotent (upserts), so it is safe to
 * re-run. Requires a live DATABASE_URL and an applied schema:
 *
 *   npm run prisma:migrate    # create/apply the schema
 *   npm run seed              # load roles, admin user, references, products
 */
import { PrismaClient } from "@prisma/client";
import { seedProducts, seedReferences } from "../src/data/seed";
import { geoZones, geoStates } from "../src/data/geography";
import {
  seedFacilities,
  FACILITY_SOURCE,
  FACILITY_SOURCE_UNVERIFIED,
  FACILITY_VERIFIED_AT
} from "../src/data/facilities";
import { seedPharmacies, PHARMACY_SOURCE } from "../src/data/pharmacies";
import { seedDoctors, DOCTOR_SOURCE, DOCTOR_VERIFIED_AT } from "../src/data/doctors";
import { seedCourses } from "../src/data/courses";
import { hashPassword } from "../src/auth/security";

const prisma = new PrismaClient();

const ROLE_KEYS = [
  "ADMIN",
  "PRODUCT_MANAGER",
  "MEDICAL_DIRECTOR",
  "SALES_REP",
  "TRAINER",
  "LEARNER"
] as const;

async function main() {
  // Roles
  const roleIds = new Map<string, string>();
  for (const key of ROLE_KEYS) {
    const role = await prisma.role.upsert({
      where: { key },
      update: {},
      create: { key, name: key.replace(/_/g, " ") }
    });
    roleIds.set(key, role.id);
  }

  // Default admin (override via env; never ship defaults to production)
  const email = process.env.SEED_ADMIN_EMAIL ?? "manager@astrobsm.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!123";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hashPassword(password),
      fullName: "Product Manager",
      locale: "en"
    }
  });
  for (const key of ["PRODUCT_MANAGER", "MEDICAL_DIRECTOR"] as const) {
    const roleId = roleIds.get(key)!;
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId }
    });
  }

  // Platform administrator (phone-based login). Override via env in production.
  const adminEmail = process.env.SEED_SUPERADMIN_EMAIL ?? "admin@astrobsm.local";
  const adminPhone = process.env.SEED_SUPERADMIN_PHONE ?? "08033328385";
  const adminPassword = process.env.SEED_SUPERADMIN_PASSWORD ?? "blackvelvet";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { phone: adminPhone, status: "ACTIVE" },
    create: {
      email: adminEmail,
      phone: adminPhone,
      passwordHash: hashPassword(adminPassword),
      fullName: "Platform Administrator",
      locale: "en",
      status: "ACTIVE"
    }
  });
  for (const key of ["ADMIN", "PRODUCT_MANAGER", "MEDICAL_DIRECTOR", "TRAINER"] as const) {
    const roleId = roleIds.get(key)!;
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId } },
      update: {},
      create: { userId: admin.id, roleId }
    });
  }

  // Reference geography: Nigeria, its six geopolitical zones and 36 states + FCT.
  // Public, verifiable groupings only — NO facility/contact records (those are
  // added solely through the provenance-enforced import pipeline).
  const country = await prisma.country.upsert({
    where: { iso2: "NG" },
    update: { name: "Nigeria" },
    create: { iso2: "NG", name: "Nigeria", language: "en" }
  });
  for (const zone of geoZones) {
    await prisma.geopoliticalZone.upsert({
      where: { id: zone.id },
      update: { name: zone.name, countryId: country.id },
      create: { id: zone.id, name: zone.name, countryId: country.id }
    });
  }
  for (const state of geoStates) {
    await prisma.stateRegion.upsert({
      where: { id: state.id },
      update: { name: state.name, code: state.capital, zoneId: state.zoneId, countryId: country.id },
      create: {
        id: state.id,
        name: state.name,
        code: state.capital,
        zoneId: state.zoneId,
        countryId: country.id
      }
    });
  }

  // Research references (explicit ids so products can link to them)
  for (const ref of seedReferences) {
    let sourceId: string | undefined;
    if (ref.source) {
      const src = await prisma.researchSource.upsert({
        where: { name: ref.source },
        update: {},
        create: { name: ref.source }
      });
      sourceId = src.id;
    }
    await prisma.researchReference.upsert({
      where: { id: ref.id },
      update: {},
      create: {
        id: ref.id,
        title: ref.title,
        authors: ref.authors,
        journal: ref.journal,
        year: ref.year,
        doi: ref.doi,
        url: ref.url,
        evidenceLevel: ref.evidenceLevel,
        summary: ref.summary,
        sourceId
      }
    });
  }

  // Products with nested ingredients/sections/faqs and reference links
  for (const p of seedProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        summary: p.summary,
        status: p.status,
        heroImage: p.image,
        i18n: { tagline: p.tagline },
        ingredients: {
          create: p.ingredients.map((i) => ({ name: i.name, percent: i.percent, role: i.role }))
        },
        sections: {
          create: p.sections.map((s, idx) => ({
            type: s.type,
            title: s.title,
            body: s.items.join("\n"),
            order: idx
          }))
        },
        faqs: {
          create: p.faqs.map((f, idx) => ({ question: f.question, answer: f.answer, order: idx }))
        },
        refLinks: { create: p.references.map((referenceId) => ({ referenceId })) }
      }
    });
  }

  // Verified tertiary-tier facilities (teaching hospitals, Federal Medical
  // Centres, federal specialist hospitals). Idempotent on (name, stateId).
  // Provenance is recorded; contact details are intentionally left blank.
  const stateById = new Map(geoStates.map((s) => [s.id, s]));
  const stateNameById = new Map(geoStates.map((s) => [s.id, s.name]));
  // Pharmacies default their provenance to the MedPlus official directory.
  const allFacilities = [
    ...seedFacilities,
    ...seedPharmacies.map((p) => ({ ...p, source: p.source ?? PHARMACY_SOURCE }))
  ];
  let facilitiesAdded = 0;
  let facilitiesUpdated = 0;
  for (const f of allFacilities) {
    const state = stateById.get(f.stateId);
    if (!state) {
      console.warn(`Skipping "${f.name}": unknown stateId "${f.stateId}"`);
      continue;
    }
    const existing = await prisma.facility.findFirst({
      where: { name: f.name, stateId: f.stateId }
    });
    const stateName = stateNameById.get(f.stateId) ?? "";
    const isVerified = f.verified !== false;
    if (existing) {
      // Backfill contact details onto already-seeded rows (e.g. phone numbers
      // sourced from official hospital websites after the initial import).
      if (f.phone && !existing.phone) {
        await prisma.facility.update({
          where: { id: existing.id },
          data: {
            phone: f.phone,
            ...(f.address ? { address: f.address } : {}),
            ...(f.source ? { source: f.source } : {})
          }
        });
        facilitiesUpdated += 1;
      }
      continue;
    }
    await prisma.facility.create({
      data: {
        countryId: country.id,
        zoneId: state.zoneId,
        stateId: f.stateId,
        name: f.name,
        type: f.type,
        address: f.address ?? (f.city ? `${f.city}, ${stateName}` : stateName),
        phone: f.phone ?? null,
        source: f.source ?? (isVerified ? FACILITY_SOURCE : FACILITY_SOURCE_UNVERIFIED),
        // verifiedAt drives the GREEN (verified) vs AMBER (unverified) badge.
        verifiedAt: isVerified ? new Date(FACILITY_VERIFIED_AT) : null
      }
    });
    facilitiesAdded += 1;
  }

  // --- Specialist Doctors Directory ---
  // Each seed doctor is matched to its host facility (by name + state) so the
  // record carries facilityId/zoneId; idempotent on fullName + facility.
  let doctorsAdded = 0;
  for (const d of seedDoctors) {
    const state = stateById.get(d.stateId);
    if (!state) {
      console.warn(`Skipping doctor "${d.fullName}": unknown stateId "${d.stateId}"`);
      continue;
    }
    const facility = await prisma.facility.findFirst({
      where: { name: d.hospitalName, stateId: d.stateId }
    });
    const existing = await prisma.doctor.findFirst({
      where: {
        fullName: d.fullName,
        ...(facility ? { facilityId: facility.id } : { hospitalName: d.hospitalName })
      }
    });
    if (existing) continue;
    const isVerified = d.verified !== false;
    await prisma.doctor.create({
      data: {
        fullName: d.fullName,
        title: d.title ?? null,
        specialty: d.specialty,
        facilityId: facility?.id ?? null,
        hospitalName: d.hospitalName,
        zoneId: facility?.zoneId ?? state.zoneId,
        stateId: d.stateId,
        city: d.city ?? null,
        phone: d.phone ?? null,
        email: d.email ?? null,
        website: d.website ?? null,
        source: d.source ?? DOCTOR_SOURCE,
        verifiedAt: isVerified ? new Date(DOCTOR_VERIFIED_AT) : null
      }
    });
    doctorsAdded += 1;
  }

  // --- LMS courses (modules, lessons, quiz) ---
  // Idempotent on slug. Mirrors the nested write used by store.createCourse so
  // production PostgreSQL carries the same Academy catalog as the dev store.
  let coursesAdded = 0;
  for (const c of seedCourses) {
    const existing = await prisma.course.findUnique({ where: { slug: c.slug }, include: { modules: { include: { lessons: true } } } });
    if (existing) {
      // Refresh only when the seeded content has more modules/lessons than what
      // is stored, so course expansions reach production without wiping data.
      const storedLessons = existing.modules.reduce((n, m) => n + m.lessons.length, 0);
      const seedLessons = c.modules.reduce((n, m) => n + m.lessons.length, 0);
      const drifted = existing.modules.length !== c.modules.length || storedLessons !== seedLessons;
      if (!drifted) continue;
      await prisma.course.delete({ where: { id: existing.id } });
    }
    await prisma.course.create({
      data: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        audience: c.audience,
        level: c.level,
        coverImage: c.coverImage ?? null,
        published: c.published,
        i18n: { accent: c.accent, durationMins: c.durationMins },
        modules: {
          create: c.modules.map((m, mIdx) => ({
            title: m.title,
            order: mIdx,
            i18n: { summary: m.summary },
            lessons: {
              create: m.lessons.map((l, lIdx) => ({
                title: l.title,
                contentType: l.contentType,
                body: l.body ?? null,
                mediaUrl: l.mediaUrl ?? null,
                order: lIdx,
                i18n: { durationMins: l.durationMins }
              }))
            }
          }))
        },
        ...(c.quiz
          ? {
              quizzes: {
                create: [
                  {
                    title: c.quiz.title,
                    passScore: c.quiz.passScore,
                    questions: {
                      create: c.quiz.questions.map((q) => ({
                        prompt: q.prompt,
                        type: q.type,
                        options: q.options,
                        correct: q.correct,
                        explanation: q.explanation ?? null
                      }))
                    }
                  }
                ]
              }
            }
          : {})
      }
    });
    coursesAdded += 1;
  }

  console.log(
    `Seed complete: ${ROLE_KEYS.length} roles, 1 admin (${email}), ` +
      `${geoZones.length} zones, ${geoStates.length} states, ` +
      `${allFacilities.length} facilities (${facilitiesAdded} new, ${facilitiesUpdated} updated, ` +
      `${seedPharmacies.length} pharmacies), ` +
      `${seedDoctors.length} doctors (${doctorsAdded} new), ` +
      `${seedCourses.length} courses (${coursesAdded} new), ` +
      `${seedReferences.length} references, ${seedProducts.length} products.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
