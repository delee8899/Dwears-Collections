import "server-only";
import { cookies } from "next/headers";
import type { CustomerSessionTokens } from "../domains/customer-auth/customer-auth.service";
const ACCESS_COOKIE = "dwears_access";
const REFRESH_COOKIE = "dwears_refresh";
const ACCESS_MAX_AGE_SECONDS = 10 * 60;
const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const COOKIE_MAX_LENGTH = 4_096;
const options = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge,
  priority: "high" as const,
});
export async function readAccessToken() {
  const value = (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
  return value && value.length <= COOKIE_MAX_LENGTH ? value : null;
}
export async function readRefreshToken() {
  const value = (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
  return value && value.length <= COOKIE_MAX_LENGTH ? value : null;
}
export async function writeCustomerAuthCookies(tokens: CustomerSessionTokens) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, tokens.accessToken, options(ACCESS_MAX_AGE_SECONDS));
  cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, options(REFRESH_MAX_AGE_SECONDS));
}
export async function clearCustomerAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}
