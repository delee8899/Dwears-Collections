import "server-only";
export type CustomerAuthConfig = {
  enabled: boolean;
  databaseUrl?: string;
  accessTokenSecret?: string;
  refreshTokenSecret?: string;
  useDatabaseTls?: boolean;
  databaseCa?: string;
};

export function getCustomerAuthConfig(): CustomerAuthConfig {
  const enabledValue = process.env.AUTH_ENABLED?.trim().toLowerCase() ?? "false";
  if (enabledValue !== "true" && enabledValue !== "false") throw new Error("AUTH_ENABLED must be 'true' or 'false'.");
  if (enabledValue === "false") return { enabled: false };

  const databaseUrl = process.env.DATABASE_URL?.trim();
  const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
  if (!databaseUrl || !accessTokenSecret || !refreshTokenSecret) {
    throw new Error("Local customer accounts require DATABASE_URL, JWT_ACCESS_SECRET, and JWT_REFRESH_SECRET.");
  }
  let parsedDatabaseUrl: URL;
  try { parsedDatabaseUrl = new URL(databaseUrl); }
  catch { throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL."); }
  if (!["postgres:", "postgresql:"].includes(parsedDatabaseUrl.protocol) || !parsedDatabaseUrl.hostname || !parsedDatabaseUrl.pathname.slice(1)) {
    throw new Error("DATABASE_URL must point to a PostgreSQL database.");
  }
  if (Buffer.byteLength(accessTokenSecret, "utf8") < 32 || Buffer.byteLength(refreshTokenSecret, "utf8") < 32) {
    throw new Error("JWT access and refresh secrets must each contain at least 32 bytes.");
  }
  if (accessTokenSecret === refreshTokenSecret) throw new Error("JWT access and refresh secrets must be different.");

  const secureDatabase = process.env.NODE_ENV === "production" || process.env.DATABASE_SSL?.trim().toLowerCase() === "true";
  const sslMode = parsedDatabaseUrl.searchParams.get("sslmode")?.toLowerCase();
  if (secureDatabase && sslMode && ["disable", "allow", "prefer", "no-verify"].includes(sslMode)) {
    throw new Error("DATABASE_URL must not disable or bypass TLS certificate verification.");
  }
  return {
    enabled: true,
    databaseUrl,
    accessTokenSecret,
    refreshTokenSecret,
    useDatabaseTls: secureDatabase,
    databaseCa: process.env.DATABASE_SSL_CA,
  };
}
