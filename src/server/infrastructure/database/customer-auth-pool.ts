import "server-only";
import { Pool } from "pg";
import { getCustomerAuthConfig } from "../../config/customer-auth-env";

type PoolGlobal = typeof globalThis & { __dwearsCustomerAuthPool?: Pool };
export function customerAuthPool() {
  const config = getCustomerAuthConfig();
  if (!config.enabled || !config.databaseUrl)
    throw new Error("Customer account storage is not configured.");
  const globalPool = globalThis as PoolGlobal;
  if (globalPool.__dwearsCustomerAuthPool)
    return globalPool.__dwearsCustomerAuthPool;

  const databaseUrl = new URL(config.databaseUrl);
  for (const parameter of [
    "sslmode",
    "sslrootcert",
    "sslcert",
    "sslkey",
    "sslpassword",
  ])
    databaseUrl.searchParams.delete(parameter);
  const pool = new Pool({
    connectionString: databaseUrl.toString(),
    ssl: config.useDatabaseTls
      ? {
          rejectUnauthorized: true,
          ...(config.databaseCa ? { ca: config.databaseCa } : {}),
        }
      : undefined,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 5_000,
    query_timeout: 8_000,
    application_name: "dwears-storefront-auth",
  });
  pool.on("error", (error: Error) => {
    console.error("Idle customer database connection failed", {
      errorName: error.name,
    });
  });
  globalPool.__dwearsCustomerAuthPool = pool;
  return pool;
}
