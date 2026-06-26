// Vercel serverless entry. All requests are rewritten to this function
// (see ../vercel.json); the exported Express app handles routing internally.
import app from "../src/index";

export default app;
