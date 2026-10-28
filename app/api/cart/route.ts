import { cartController } from "@/server/domains/storefront/storefront";
import { readCartId, writeCartId } from "@/server/http/cart-cookie";
import { readJsonBody } from "@/server/http/request-security";
import { failure } from "@/server/shared/http/api-result";
import { toNextResponse } from "@/server/shared/http/next-response";
import { withApiMiddleware } from "@/server/shared/http/with-api-middleware";
export const dynamic = "force-dynamic";
export const GET = withApiMiddleware("cart.read", async () => {
  const result = await cartController().get(await readCartId());
  if (result.effects?.cartId === null) await writeCartId(null);
  return toNextResponse(result);
});
export const POST = withApiMiddleware("cart.update", async (request) => {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return toNextResponse(failure(parsed.status, parsed.error, parsed.code));
  const result = await cartController().mutate(await readCartId(), parsed.value);
  if (result.status === 200 && result.effects?.cartId !== undefined) await writeCartId(result.effects.cartId);
  return toNextResponse(result);
}, { requireSameOrigin: true });
