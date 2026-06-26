/** Centralized configuration. Secrets come from the environment — never hardcode. */
export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(","),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me",
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "7d"
  },
  isProd: process.env.NODE_ENV === "production"
};

if (config.isProd) {
  for (const [key, val] of Object.entries({
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
  })) {
    if (!val) throw new Error(`Missing required production secret: ${key}`);
  }
}
