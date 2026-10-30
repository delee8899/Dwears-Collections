import assert from "node:assert/strict";
import test from "node:test";
import { createCustomerAuthService } from "../../src/server/domains/customer-auth/customer-auth.service";
import type { CustomerAuthRepository } from "../../src/server/domains/customer-auth/customer-auth.repository";
import type {
  CustomerAccount,
  RefreshRotation,
} from "../../src/server/domains/customer-auth/customer-auth.types";
import { hashRefreshToken } from "../../src/server/auth/customer-jwt";

const secrets = {
  accessTokenSecret: "a".repeat(32),
  refreshTokenSecret: "b".repeat(32),
};
function setup() {
  const customer: CustomerAccount = {
    id: "234e4ef4-7a01-44a1-a344-0da78dc50475",
    email: "shopper@example.com",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  };
  const sessions = new Map<string, { customerId: string; revoked: boolean }>();
  const tokens = new Map<string, { sessionId: string; consumed: boolean }>();
  const repository: CustomerAuthRepository = {
    createCustomer: async (email) => ({ ...customer, email }),
    findCredentialByEmail: async () => null,
    findCustomerById: async () => customer,
    findCustomerForActiveSession: async (customerId, sessionId) =>
      sessions.get(sessionId)?.customerId === customerId &&
      !sessions.get(sessionId)?.revoked
        ? customer
        : null,
    createSession: async (customerId, sessionId, refreshHash) => {
      sessions.set(sessionId, { customerId, revoked: false });
      tokens.set(refreshHash, { sessionId, consumed: false });
    },
    rotateRefreshToken: async (oldHash, nextHash): Promise<RefreshRotation> => {
      const old = tokens.get(oldHash);
      if (!old) return { status: "invalid" };
      if (old.consumed) {
        sessions.get(old.sessionId)!.revoked = true;
        return { status: "reused" };
      }
      old.consumed = true;
      tokens.set(nextHash, { sessionId: old.sessionId, consumed: false });
      return { status: "rotated", customer, sessionId: old.sessionId };
    },
    revokeRefreshToken: async (tokenHash) => {
      const token = tokens.get(tokenHash);
      if (token) sessions.get(token.sessionId)!.revoked = true;
    },
  };
  return {
    service: createCustomerAuthService(repository, secrets),
    customer,
    sessions,
  };
}

test("registration normalizes email, hashes the password, and returns session tokens", async () => {
  const { service, customer } = setup();
  const result = await service.register(
    " Shopper@Example.com ",
    "correct horse battery staple",
  );
  assert.equal(result.customer.email, customer.email);
  assert.ok(result.tokens.accessToken.split(".").length === 3);
  assert.ok(result.tokens.refreshToken.split(".").length === 3);
});

test("refresh rotates the token and reuse revokes the session", async () => {
  const { service, customer, sessions } = setup();
  const initial = await service.register(
    customer.email,
    "correct horse battery staple",
  );
  const rotated = await service.refresh(initial.tokens.refreshToken);
  assert.ok(rotated.tokens.refreshToken !== initial.tokens.refreshToken);
  await assert.rejects(service.refresh(initial.tokens.refreshToken), {
    code: "INVALID_REFRESH_TOKEN",
  });
  await assert.rejects(service.authenticate(rotated.tokens.accessToken), {
    code: "AUTHENTICATION_REQUIRED",
  });
  assert.equal([...sessions.values()][0].revoked, true);
});

test("logout revokes the active session and malformed refresh values do not reach storage", async () => {
  const { service, customer } = setup();
  const initial = await service.register(
    customer.email,
    "correct horse battery staple",
  );
  await service.logout(initial.tokens.refreshToken);
  await assert.rejects(service.authenticate(initial.tokens.accessToken), {
    code: "AUTHENTICATION_REQUIRED",
  });
  await service.logout("not-a-jwt");
  assert.equal(hashRefreshToken("same").length, 64);
});

test("account inputs reject invalid emails and weak passwords", async () => {
  const { service } = setup();
  await assert.rejects(
    service.register("not-an-email", "correct horse battery staple"),
    { code: "INVALID_EMAIL" },
  );
  await assert.rejects(service.register("person@example.com", "short"), {
    code: "INVALID_PASSWORD",
  });
});
