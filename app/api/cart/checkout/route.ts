import { cartController } from "@/server/domains/storefront/storefront";
import { readCartId } from "@/server/http/cart-cookie";
import { toNextResponse } from "@/server/shared/http/next-response";
import { withApiMiddleware } from "@/server/shared/http/with-api-middleware";
export const dynamic = "force-dynamic";
export const POST = withApiMiddleware("cart.checkout", async () => {
  return toNextResponse(await cartController().checkout(await readCartId()));
}, { requireSameOrigin: true });
