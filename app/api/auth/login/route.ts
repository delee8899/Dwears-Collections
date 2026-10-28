import { customerAuthController } from "@/server/controllers/customer-auth-composition";
import { readCustomerCredentials } from "@/server/http/customer-auth-request";
import { writeCustomerAuthCookies } from "@/server/http/customer-auth-cookies";
import { failure } from "@/server/shared/http/api-result";
import { toNextResponse } from "@/server/shared/http/next-response";
import { withApiMiddleware } from "@/server/shared/http/with-api-middleware";
export const dynamic = "force-dynamic";
export const POST = withApiMiddleware("auth.login", async (request) => {
  const credentials = await readCustomerCredentials(request);
  if (!credentials.ok) return toNextResponse(failure(credentials.status, credentials.error, credentials.code));
  const result = await customerAuthController().login(credentials.email, credentials.password);
  if (result.cookieTokens) await writeCustomerAuthCookies(result.cookieTokens);
  return toNextResponse(result.response);
}, { requireSameOrigin: true });
