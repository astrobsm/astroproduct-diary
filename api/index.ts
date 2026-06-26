// Single-project Vercel serverless entry. All /api/* requests are rewritten
// here (see ../vercel.json); the exported Express app handles routing.
//
// The Express app is bundled to apps/api/dist/server.cjs by `npm run build:api`
// (esbuild). All npm deps are bundled in EXCEPT @prisma/client, which stays
// external so its native query engine resolves from apps/api/node_modules at
// runtime — that's also why the bundle lives under apps/api/dist. The app is
// imported lazily so any initialization failure (missing env vars, Prisma
// engine load errors, etc.) is surfaced as a JSON 500 instead of an opaque
// Vercel FUNCTION_INVOCATION_FAILED crash.
import type { IncomingMessage, ServerResponse } from "node:http";

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

let appPromise: Promise<Handler> | null = null;

function loadApp(): Promise<Handler> {
  if (!appPromise) {
    appPromise = import("../apps/api/dist/server.cjs").then((m: Record<string, unknown>) => {
      const d = (m.default ?? m) as Record<string, unknown>;
      return ((d.default ?? d) as Handler);
    });
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
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "INIT_FAILED", message }));
  }
}
