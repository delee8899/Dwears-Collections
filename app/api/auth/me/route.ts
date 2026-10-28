import { customerAuthController } from "@/server/controllers/customer-auth-composition";
import { readAccessToken } from "@/server/http/customer-auth-cookies";
import { toNextResponse } from "@/server/shared/http/next-response";
import { withApiMiddleware } from "@/server/shared/http/with-api-middleware";
export const dynamic = "force-dynamic";
export const GET = withApiMiddleware("auth.me", async () => {
  return toNextResponse((await customerAuthController().me(await readAccessToken())).response);
});
