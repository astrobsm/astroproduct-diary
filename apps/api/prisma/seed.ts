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

  console.log(
    `Seed complete: ${ROLE_KEYS.length} roles, 1 admin (${email}), ` +
      `${geoZones.length} zones, ${geoStates.length} states, ` +
      `${seedReferences.length} references, ${seedProducts.length} products.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
