/** Centralized configuration. Secrets come from the environment — never hardcode. */

/**
 * Resolve the Supabase project URL for Storage. Uses SUPABASE_URL when set,
 * otherwise derives it from the `postgres.<ref>` username in the database
 * connection string (Supabase poolers embed the project ref there).
 */
function resolveSupabaseUrl(): string | undefined {
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL.replace(/\/+$/, "");
  const conn = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
  const match = conn.match(/postgres\.([a-z0-9]{16,})/i);
  return match ? `https://${match[1]}.supabase.co` : undefined;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(","),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me",
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "7d"
  },
  /**
   * Supabase Storage — optional durable image backup. When a service-role key
   * is present, uploaded images are stored as files and served from a public
   * URL; otherwise the client keeps the inline data-URL copy.
   */
  supabase: {
    url: resolveSupabaseUrl(),
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: process.env.SUPABASE_STORAGE_BUCKET ?? "astrobsm-uploads"
  },
  isProd: process.env.NODE_ENV === "production"
};

/** True when Supabase Storage is configured and uploads can be persisted. */
export const storageEnabled = Boolean(config.supabase.url && config.supabase.serviceKey);

if (config.isProd) {
  for (const [key, val] of Object.entries({
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
  })) {
    if (!val) throw new Error(`Missing required production secret: ${key}`);
  }
}
