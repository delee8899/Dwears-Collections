import { randomUUID } from "node:crypto";
import type { CustomerAuthRepository } from "./customer-auth.repository";
import { CustomerAuthError, type CustomerAccount } from "./customer-auth.types";
import {
  hashRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../auth/customer-jwt";
import {
  burnPasswordVerification,
  hashPassword,
  verifyPassword,
} from "../../auth/password-hash";

const ACCESS_TTL_SECONDS = 10 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;
export type CustomerAuthSecrets = {
  accessTokenSecret: string;
  refreshTokenSecret: string;
};
export type CustomerSessionTokens = {
  accessToken: string;
  refreshToken: string;
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function normalizeCustomerEmail(email: string) {
  return email.trim().toLowerCase();
}
export function isValidCustomerEmail(email: string) {
  return (
    email.length <= 254 &&
    email === normalizeCustomerEmail(email) &&
    emailPattern.test(email)
  );
}
export function isValidCustomerPassword(password: string) {
  return (
    password.length >= 12 &&
    password.length <= 128 &&
    Buffer.byteLength(password, "utf8") <= 1_024
  );
}
function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

export function createCustomerAuthService(
  repository: CustomerAuthRepository,
  secrets: CustomerAuthSecrets,
) {
  async function issueSession(
    customer: CustomerAccount,
    sessionId = randomUUID(),
  ): Promise<{ customer: CustomerAccount; tokens: CustomerSessionTokens }> {
    const now = new Date();
    const refreshExpiresAt = new Date(
      now.getTime() + REFRESH_TTL_SECONDS * 1_000,
    );
    const accessToken = await signAccessToken(
      customer.id,
      sessionId,
      secrets.accessTokenSecret,
      now,
      ACCESS_TTL_SECONDS,
    );
    const refreshToken = await signRefreshToken(
      customer.id,
      sessionId,
      secrets.refreshTokenSecret,
      now,
      REFRESH_TTL_SECONDS,
    );
    await repository.createSession(
      customer.id,
      sessionId,
      hashRefreshToken(refreshToken),
      refreshExpiresAt,
    );
    return { customer, tokens: { accessToken, refreshToken } };
  }

  return {
    async register(emailInput: string, password: string) {
      const email = normalizeCustomerEmail(emailInput);
      if (!isValidCustomerEmail(email))
        throw new CustomerAuthError(
          "Enter a valid email address.",
          400,
          "INVALID_EMAIL",
        );
      if (!isValidCustomerPassword(password))
        throw new CustomerAuthError(
          "Use a password between 12 and 128 characters.",
          400,
          "INVALID_PASSWORD",
        );
      const passwordHash = await hashPassword(password);
      let customer: CustomerAccount;
      try {
        customer = await repository.createCustomer(email, passwordHash);
      } catch (error) {
        if (isUniqueViolation(error))
          throw new CustomerAuthError(
            "An account with this email already exists.",
            409,
            "EMAIL_ALREADY_REGISTERED",
          );
        throw error;
      }
      return issueSession(customer);
    },

    async login(emailInput: string, password: string) {
      const email = normalizeCustomerEmail(emailInput);
      if (
        !isValidCustomerEmail(email) ||
        typeof password !== "string" ||
        password.length > 128
      ) {
        throw new CustomerAuthError(
          "Email or password is incorrect.",
          401,
          "INVALID_CREDENTIALS",
        );
      }
      const credential = await repository.findCredentialByEmail(email);
      if (!credential) {
        await burnPasswordVerification(password);
        throw new CustomerAuthError(
          "Email or password is incorrect.",
          401,
          "INVALID_CREDENTIALS",
        );
      }
      if (!(await verifyPassword(password, credential.passwordHash))) {
        throw new CustomerAuthError(
          "Email or password is incorrect.",
          401,
          "INVALID_CREDENTIALS",
        );
      }
      return issueSession({
        id: credential.id,
        email: credential.email,
        createdAt: credential.createdAt,
      });
    },

    async refresh(refreshToken: string | null) {
      if (!refreshToken || refreshToken.length > 4_096)
        throw new CustomerAuthError(
          "Your session has expired. Sign in again.",
          401,
          "INVALID_REFRESH_TOKEN",
        );
      const claims = await verifyRefreshToken(
        refreshToken,
        secrets.refreshTokenSecret,
      );
      const now = new Date();
      const refreshExpiresAt = new Date(
        now.getTime() + REFRESH_TTL_SECONDS * 1_000,
      );
      const nextAccessToken = await signAccessToken(
        claims.subject,
        claims.sessionId,
        secrets.accessTokenSecret,
        now,
        ACCESS_TTL_SECONDS,
      );
      const nextRefreshToken = await signRefreshToken(
        claims.subject,
        claims.sessionId,
        secrets.refreshTokenSecret,
        now,
        REFRESH_TTL_SECONDS,
      );
      const rotation = await repository.rotateRefreshToken(
        hashRefreshToken(refreshToken),
        hashRefreshToken(nextRefreshToken),
        refreshExpiresAt,
      );
      if (rotation.status !== "rotated")
        throw new CustomerAuthError(
          "Your session has expired. Sign in again.",
          401,
          "INVALID_REFRESH_TOKEN",
        );
      return {
        customer: rotation.customer,
        tokens: {
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
        },
      };
    },

    async authenticate(accessToken: string | null) {
      if (!accessToken || accessToken.length > 4_096)
        throw new CustomerAuthError(
          "Sign in to continue.",
          401,
          "AUTHENTICATION_REQUIRED",
        );
      const claims = await verifyAccessToken(
        accessToken,
        secrets.accessTokenSecret,
      );
      const customer = await repository.findCustomerForActiveSession(
        claims.subject,
        claims.sessionId,
      );
      if (!customer)
        throw new CustomerAuthError(
          "Your session has expired. Sign in again.",
          401,
          "AUTHENTICATION_REQUIRED",
        );
      return customer;
    },

    async logout(refreshToken: string | null) {
      if (!refreshToken || refreshToken.length > 4_096) return;
      try {
        await verifyRefreshToken(refreshToken, secrets.refreshTokenSecret);
      } catch {
        return;
      }
      await repository.revokeRefreshToken(hashRefreshToken(refreshToken));
    },
  };
}
export type CustomerAuthService = ReturnType<typeof createCustomerAuthService>;
