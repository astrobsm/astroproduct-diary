import { Router } from "express";
import { z } from "zod";
import { asyncHandler, badRequest, notFound } from "../http/errors";
import { store } from "../store/store";
import { requireAuth, requireRole } from "../auth/rbac";

export const productsRouter = Router();

const sectionSchema = z.object({
  type: z.enum([
    "DESCRIPTION",
    "MECHANISM",
    "ADVANTAGES",
    "INDICATIONS",
    "APPLICATION",
    "PRECAUTIONS",
    "STORAGE"
  ]),
  title: z.string().min(1),
  items: z.array(z.string().min(1))
});

const productSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers and hyphens"),
  name: z.string().min(2),
  tagline: z.string().default(""),
  category: z.string().min(1),
  summary: z.string().default(""),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  image: z.string().optional(),
  ingredients: z
    .array(z.object({ name: z.string().min(1), percent: z.string().optional(), role: z.string() }))
    .default([]),
  sections: z.array(sectionSchema).default([]),
  faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).default([]),
  references: z.array(z.string()).default([])
});

// GET /products  (public read)
productsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, status, q } = req.query as Record<string, string | undefined>;
    const data = await store.listProducts({ category, status, q });
    res.json({ data, meta: { total: data.length } });
  })
);

// GET /products/:slug  (public read; expands references)
productsRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const { slug } = req.params as { slug: string };
    const product = await store.getProductBySlug(slug);
    if (!product) throw notFound("Product not found");
    const references = await store.getReferencesByIds(product.references);
    res.json({ data: { ...product, referenceDetails: references } });
  })
);

// POST /products  (PRODUCT_MANAGER / MEDICAL_DIRECTOR)
productsRouter.post(
  "/",
  requireAuth,
  requireRole("PRODUCT_MANAGER", "MEDICAL_DIRECTOR"),
  asyncHandler(async (req, res) => {
    const input = productSchema.parse(req.body);
    if (await store.getProductBySlug(input.slug)) {
      throw badRequest(`A product with slug "${input.slug}" already exists`);
    }
    const created = await store.createProduct(input);
    res.status(201).json({ data: created });
  })
);

// PUT /products/:id  (PRODUCT_MANAGER / MEDICAL_DIRECTOR)
productsRouter.put(
  "/:id",
  requireAuth,
  requireRole("PRODUCT_MANAGER", "MEDICAL_DIRECTOR"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const existing = await store.getProductById(id);
    if (!existing) throw notFound("Product not found");
    const patch = productSchema.partial().parse(req.body);
    if (patch.slug && patch.slug !== existing.slug && (await store.getProductBySlug(patch.slug))) {
      throw badRequest(`A product with slug "${patch.slug}" already exists`);
    }
    const updated = await store.updateProduct(id, patch);
    res.json({ data: updated });
  })
);

// DELETE /products/:id  (PRODUCT_MANAGER / MEDICAL_DIRECTOR)
productsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("PRODUCT_MANAGER", "MEDICAL_DIRECTOR"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const ok = await store.deleteProduct(id);
    if (!ok) throw notFound("Product not found");
    res.status(204).send();
  })
);
