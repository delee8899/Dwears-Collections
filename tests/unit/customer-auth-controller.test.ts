import assert from "node:assert/strict";
import test from "node:test";
import { createCustomerAuthController } from "../../src/server/controllers/customer-auth.controller";
import type { CustomerAuthService } from "../../src/server/domains/customer-auth/customer-auth.service";

test("auth controller returns customer data separately from cookie token effects", async () => {
  const tokens = {
    accessToken: "access.jwt.value",
    refreshToken: "refresh.jwt.value",
  };
  const service = {
    register: async () => ({
      customer: {
        id: "id",
        email: "person@example.com",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
      tokens,
    }),
  } as unknown as CustomerAuthService;
  const result = await createCustomerAuthController(service).register(
    "person@example.com",
    "correct horse battery staple",
  );
  assert.deepEqual(result.cookieTokens, tokens);
  assert.deepEqual(result.response.body, {
    customer: {
      id: "id",
      email: "person@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  });
  assert.equal(JSON.stringify(result.response.body).includes("jwt"), false);
});
