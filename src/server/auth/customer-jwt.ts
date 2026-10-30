import { randomUUID, createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { CustomerAuthError } from "../domains/customer-auth/customer-auth.types";
const ISSUER = "dwears-collections";
const AUDIENCE = "dwears-customer-account";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type VerifiedCustomerToken = {
  subject: string;
  sessionId: string;
  tokenId: string;
};
function key(secret: string) {
  return new TextEncoder().encode(secret);
}
function invalidToken() {
  return new CustomerAuthError(
    "Your session has expired. Sign in again.",
    401,
    "INVALID_TOKEN",
  );
}

async function signToken(
  subject: string,
  sessionId: string,
  secret: string,
  tokenUse: "access" | "refresh",
  now: Date,
  lifetimeSeconds: number,
) {
  return new SignJWT({ token_use: tokenUse, sid: sessionId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setSubject(subject)
    .setJti(randomUUID())
    .setIssuedAt(Math.floor(now.getTime() / 1_000))
    .setNotBefore(Math.floor(now.getTime() / 1_000))
    .setExpirationTime(Math.floor(now.getTime() / 1_000) + lifetimeSeconds)
    .sign(key(secret));
}
export const signAccessToken = (
  subject: string,
  sessionId: string,
  secret: string,
  now: Date,
  lifetimeSeconds: number,
) => signToken(subject, sessionId, secret, "access", now, lifetimeSeconds);
export const signRefreshToken = (
  subject: string,
  sessionId: string,
  secret: string,
  now: Date,
  lifetimeSeconds: number,
) => signToken(subject, sessionId, secret, "refresh", now, lifetimeSeconds);

async function verifyToken(
  token: string,
  secret: string,
  tokenUse: "access" | "refresh",
  maxAge: string,
): Promise<VerifiedCustomerToken> {
  try {
    const { payload, protectedHeader } = await jwtVerify(token, key(secret), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
      maxTokenAge: maxAge,
      clockTolerance: 5,
    });
    if (
      protectedHeader.typ !== "JWT" ||
      payload.token_use !== tokenUse ||
      typeof payload.sub !== "string" ||
      !UUID_PATTERN.test(payload.sub) ||
      typeof payload.sid !== "string" ||
      !UUID_PATTERN.test(payload.sid) ||
      typeof payload.jti !== "string" ||
      !UUID_PATTERN.test(payload.jti)
    ) {
      throw invalidToken();
    }
    return {
      subject: payload.sub,
      sessionId: payload.sid,
      tokenId: payload.jti,
    };
  } catch (error) {
    if (error instanceof CustomerAuthError) throw error;
    throw invalidToken();
  }
}
export const verifyAccessToken = (token: string, secret: string) =>
  verifyToken(token, secret, "access", "11m");
export const verifyRefreshToken = (token: string, secret: string) =>
  verifyToken(token, secret, "refresh", "31d");
export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
