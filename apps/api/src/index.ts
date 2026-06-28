import express from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "./config";
import { errorMiddleware } from "./http/errors";
import { authRouter } from "./routes/auth.routes";
import { productsRouter } from "./routes/products.routes";
import { researchRouter } from "./routes/research.routes";
import { lmsRouter } from "./routes/lms.routes";
import { hospitalsRouter } from "./routes/hospitals.routes";
import { doctorsRouter } from "./routes/doctors.routes";
import { crmRouter } from "./routes/crm.routes";
import { campaignsRouter } from "./routes/campaigns.routes";
import { analyticsRouter } from "./routes/analytics.routes";
import { totRouter } from "./routes/tot.routes";
import { coachRouter } from "./routes/coach.routes";
import { uploadsRouter } from "./routes/uploads.routes";

/**
 * ASTROBSM API — Phase 2.
 *
 * Modular monolith (docs/01-architecture.md). Live endpoints for identity,
 * products (read + CRUD) and research (read + import pipeline). Backed by an
 * in-memory store seeded from official content; production swaps in Prisma /
 * PostgreSQL (prisma/schema.prisma) behind the same repository interface.
 */
const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "astrobsm-api", time: new Date().toISOString() });
});

const v1 = express.Router();

v1.get("/", (_req, res) => {
  res.json({
    name: "ASTROBSM Academy & Sales Intelligence API",
    version: "v1",
    modules: [
      "identity",
      "products",
      "research",
      "lms",
      "hospitals",
      "doctors",
      "crm",
      "campaigns",
      "analytics",
      "tot",
      "coach",
      "uploads"
    ],
    note: "Phase 2: live products + research with import pipeline; LMS course catalog + enrollment; National Hospital Database (geo + facilities)."
  });
});

v1.use("/auth", authRouter);
v1.use("/products", productsRouter);
v1.use("/research", researchRouter);
v1.use("/lms", lmsRouter);
v1.use("/crm", crmRouter);
v1.use("/marketing", campaignsRouter);
v1.use("/analytics", analyticsRouter);
v1.use("/tot", totRouter);
v1.use("/coach", coachRouter);
v1.use("/uploads", uploadsRouter);
v1.use("/", hospitalsRouter);
v1.use("/", doctorsRouter);

app.use("/api/v1", v1);

// Final error handler — must be last.
app.use(errorMiddleware);

// On Vercel the app is exported and invoked per-request as a serverless
// function (see ../api/index.ts); locally we bind a port and listen.
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`ASTROBSM API listening on http://localhost:${config.port}`);
  });
}

export default app;
