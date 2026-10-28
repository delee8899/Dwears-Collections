import { customerAuthController } from "@/server/controllers/customer-auth-composition";
import { clearCustomerAuthCookies, readRefreshToken, writeCustomerAuthCookies } from "@/server/http/customer-auth-cookies";
import { toNextResponse } from "@/server/shared/http/next-response";
import { withApiMiddleware } from "@/server/shared/http/with-api-middleware";
export const dynamic = "force-dynamic";
export const POST = withApiMiddleware("auth.refresh", async () => {
  const result = await customerAuthController().refresh(await readRefreshToken());
  if (result.cookieTokens) await writeCustomerAuthCookies(result.cookieTokens);
  else if (result.response.status === 401) await clearCustomerAuthCookies();
  return toNextResponse(result.response);
}, { requireSameOrigin: true });
