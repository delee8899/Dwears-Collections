import { customerAuthController } from "@/server/controllers/customer-auth-composition";
import { clearCustomerAuthCookies, readRefreshToken } from "@/server/http/customer-auth-cookies";
import { toNextResponse } from "@/server/shared/http/next-response";
import { withApiMiddleware } from "@/server/shared/http/with-api-middleware";
export const dynamic = "force-dynamic";
export const POST = withApiMiddleware("auth.logout", async () => {
  const result = await customerAuthController().logout(await readRefreshToken());
  if (result.clearCookies) await clearCustomerAuthCookies();
  return toNextResponse(result.response);
}, { requireSameOrigin: true });
