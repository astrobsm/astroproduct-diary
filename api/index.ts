// Single-project Vercel serverless entry. All /api/* requests are rewritten
// here (see ../vercel.json); the exported Express app handles routing.
import app from "../apps/api/src/index";

export default app;
