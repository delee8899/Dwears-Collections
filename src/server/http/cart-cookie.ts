import "server-only";
import { cookies } from "next/headers";
const COOKIE_NAME = "dwears_cart";
const MAX_COOKIE_VALUE_LENGTH = 3_500;
export async function readCartId() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value ?? null;
  return value && value.length <= MAX_COOKIE_VALUE_LENGTH ? value : null;
}
export async function writeCartId(cartId: string | null) {
  const cookieStore = await cookies();
  if (!cartId || cartId.length > MAX_COOKIE_VALUE_LENGTH) {
    cookieStore.delete(COOKIE_NAME);
    return;
  }
  cookieStore.set(COOKIE_NAME, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    priority: "high",
  });
}

