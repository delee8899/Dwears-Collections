import "server-only";
import type { Pool, PoolClient } from "pg";
import type { CustomerAuthRepository } from "../../domains/customer-auth/customer-auth.repository";
import type {
  CustomerAccount,
  RefreshRotation,
} from "../../domains/customer-auth/customer-auth.types";

type CustomerRow = { id: string; email: string; created_at: Date };
type CredentialRow = CustomerRow & { password_hash: string };
type RotationRow = {
  session_id: string;
  customer_id: string;
  email: string;
  created_at: Date;
  token_expires_at: Date;
  token_consumed_at: Date | null;
  session_expires_at: Date;
  session_revoked_at: Date | null;
};
const mapCustomer = (row: CustomerRow): CustomerAccount => ({
  id: row.id,
  email: row.email,
  createdAt: row.created_at,
});
async function rollback(client: PoolClient) {
  try {
    await client.query("ROLLBACK");
  } catch {
    /* Keep the original storage error. */
  }
}

export function createPostgresCustomerAuthRepository(
  pool: Pool,
): CustomerAuthRepository {
  return {
    async createCustomer(email, passwordHash) {
      const result = await pool.query<CustomerRow>(
        "INSERT INTO customer_accounts (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
        [email, passwordHash],
      );
      return mapCustomer(result.rows[0]);
    },
    async findCredentialByEmail(email) {
      const result = await pool.query<CredentialRow>(
        "SELECT id, email, password_hash, created_at FROM customer_accounts WHERE email = $1 AND disabled_at IS NULL LIMIT 1",
        [email],
      );
      const row = result.rows[0];
      return row
        ? {
            id: row.id,
            email: row.email,
            createdAt: row.created_at,
            passwordHash: row.password_hash,
          }
        : null;
    },
    async findCustomerById(id) {
      const result = await pool.query<CustomerRow>(
        "SELECT id, email, created_at FROM customer_accounts WHERE id = $1 AND disabled_at IS NULL LIMIT 1",
        [id],
      );
      return result.rows[0] ? mapCustomer(result.rows[0]) : null;
    },
    async findCustomerForActiveSession(customerId, sessionId) {
      const result = await pool.query<CustomerRow>(
        `SELECT a.id, a.email, a.created_at
         FROM customer_accounts AS a
         INNER JOIN customer_auth_sessions AS s ON s.customer_id = a.id
         WHERE a.id = $1 AND s.id = $2 AND a.disabled_at IS NULL
           AND s.revoked_at IS NULL AND s.expires_at > NOW()
         LIMIT 1`,
        [customerId, sessionId],
      );
      return result.rows[0] ? mapCustomer(result.rows[0]) : null;
    },
    async createSession(customerId, sessionId, refreshTokenHash, expiresAt) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          "DELETE FROM customer_auth_sessions WHERE expires_at <= NOW() OR revoked_at IS NOT NULL",
        );
        await client.query(
          "INSERT INTO customer_auth_sessions (id, customer_id, expires_at) VALUES ($1, $2, $3)",
          [sessionId, customerId, expiresAt],
        );
        await client.query(
          "INSERT INTO customer_refresh_tokens (token_hash, session_id, expires_at) VALUES ($1, $2, $3)",
          [refreshTokenHash, sessionId, expiresAt],
        );
        await client.query("COMMIT");
      } catch (error) {
        await rollback(client);
        throw error;
      } finally {
        client.release();
      }
    },
    async rotateRefreshToken(
      currentTokenHash,
      nextTokenHash,
      nextExpiresAt,
    ): Promise<RefreshRotation> {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selected = await client.query<RotationRow>(
          `SELECT s.id AS session_id, s.customer_id, s.expires_at AS session_expires_at, s.revoked_at AS session_revoked_at,
                  t.expires_at AS token_expires_at, t.consumed_at AS token_consumed_at,
                  a.email, a.created_at
           FROM customer_refresh_tokens AS t
           INNER JOIN customer_auth_sessions AS s ON s.id = t.session_id
           INNER JOIN customer_accounts AS a ON a.id = s.customer_id
           WHERE t.token_hash = $1 AND a.disabled_at IS NULL
           FOR UPDATE OF t, s`,
          [currentTokenHash],
        );
        const row = selected.rows[0];
        if (!row) {
          await client.query("COMMIT");
          return { status: "invalid" };
        }
        if (row.token_consumed_at) {
          await client.query(
            "UPDATE customer_auth_sessions SET revoked_at = COALESCE(revoked_at, NOW()) WHERE id = $1",
            [row.session_id],
          );
          await client.query("COMMIT");
          return { status: "reused" };
        }
        if (
          row.session_revoked_at ||
          row.session_expires_at <= new Date() ||
          row.token_expires_at <= new Date()
        ) {
          await client.query("COMMIT");
          return { status: "invalid" };
        }
        await client.query(
          "UPDATE customer_refresh_tokens SET consumed_at = NOW() WHERE token_hash = $1",
          [currentTokenHash],
        );
        await client.query(
          "INSERT INTO customer_refresh_tokens (token_hash, session_id, expires_at) VALUES ($1, $2, $3)",
          [nextTokenHash, row.session_id, nextExpiresAt],
        );
        await client.query(
          "UPDATE customer_auth_sessions SET last_used_at = NOW() WHERE id = $1",
          [row.session_id],
        );
        await client.query("COMMIT");
        return {
          status: "rotated",
          sessionId: row.session_id,
          customer: {
            id: row.customer_id,
            email: row.email,
            createdAt: row.created_at,
          },
        };
      } catch (error) {
        await rollback(client);
        throw error;
      } finally {
        client.release();
      }
    },
    async revokeRefreshToken(tokenHash) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await client.query<{ session_id: string }>(
          "SELECT session_id FROM customer_refresh_tokens WHERE token_hash = $1 FOR UPDATE",
          [tokenHash],
        );
        const sessionId = result.rows[0]?.session_id;
        if (sessionId)
          await client.query(
            "UPDATE customer_auth_sessions SET revoked_at = COALESCE(revoked_at, NOW()) WHERE id = $1",
            [sessionId],
          );
        await client.query("COMMIT");
      } catch (error) {
        await rollback(client);
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
