import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
const isProduction = process.env.NODE_ENV === "production";
const useTls = isProduction || process.env.DATABASE_SSL?.trim().toLowerCase() === "true";
const databaseUrl = process.env.DATABASE_MIGRATION_URL || (!isProduction ? process.env.DATABASE_URL : undefined);
if (!databaseUrl) throw new Error("Set DATABASE_MIGRATION_URL to run account database migrations.");
const parsedUrl = new URL(databaseUrl);
if (!["postgres:", "postgresql:"].includes(parsedUrl.protocol)) throw new Error("The migration URL must point to PostgreSQL.");
for (const parameter of ["sslmode", "sslrootcert", "sslcert", "sslkey", "sslpassword"]) parsedUrl.searchParams.delete(parameter);
const client = new Client({
  connectionString: parsedUrl.toString(),
  ssl: useTls ? { rejectUnauthorized: true, ...(process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA } : {}) } : undefined,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 10_000,
  application_name: "dwears-auth-migrations",
});
const version = "001_customer_auth";
try {
  await client.connect();
  await client.query("SELECT pg_advisory_lock(824601184)");
  await client.query("CREATE TABLE IF NOT EXISTS dwears_schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT NOW())");
  const existing = await client.query("SELECT version FROM dwears_schema_migrations WHERE version = $1", [version]);
  if (existing.rowCount) {
    process.stdout.write(`${version} already applied.\n`);
  } else {
    const migrationPath = fileURLToPath(new URL("../db/migrations/001_customer_auth.sql", import.meta.url));
    const migration = await readFile(migrationPath, "utf8");
    await client.query("BEGIN");
    try {
      await client.query(migration);
      await client.query("INSERT INTO dwears_schema_migrations (version) VALUES ($1)", [version]);
      await client.query("COMMIT");
      process.stdout.write(`${version} applied.\n`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  try { await client.query("SELECT pg_advisory_unlock(824601184)"); } catch { /* A disconnected client has already released its lock. */ }
  await client.end();
}
