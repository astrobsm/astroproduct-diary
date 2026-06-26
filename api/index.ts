// Single-project Vercel serverless entry. All /api/* requests are rewritten
// here (see ../vercel.json); the exported Express app handles routing.
//
// The app is imported lazily so that any initialization failure (missing env
// vars, Prisma engine load errors, etc.) is surfaced as a JSON 500 response
// instead of an opaque Vercel FUNCTION_INVOCATION_FAILED crash.
import type { IncomingMessage, ServerResponse } from "node:http";

type AppModule = { default: (req: IncomingMessage, res: ServerResponse) => void };

let appPromise: Promise<AppModule["default"]> | null = null;

function loadApp(): Promise<AppModule["default"]> {
  if (!appPromise) {
    appPromise = import("../apps/api/src/index").then((m: AppModule) => m.default);
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await loadApp();
    return app(req, res);
  } catch (err) {
    appPromise = null;
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "INIT_FAILED", message, stack }));
  }
}
