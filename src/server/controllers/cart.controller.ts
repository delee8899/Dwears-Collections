import type { CartSnapshotDTO } from "../../contracts/storefront";
import { CartInputError, CartUnavailableError } from "../domains/cart/cart.types";
import type { CartService } from "../domains/cart/cart.service";
import { parseCartMutation } from "../http/cart-input";
import { toCartDTO } from "../presenters/storefront-mapper";
import { failure, success, type ApiResult } from "../shared/http/api-result";
type CartServicePort = Pick<CartService, "getCart" | "mutate" | "getCheckoutUrl">;
function mapCartError<T>(error: unknown, fallback: string, code: string, reportError?: (error: unknown) => void): ApiResult<T> {
  if (error instanceof CartInputError) return failure(400, error.message, error.code);
  if (error instanceof CartUnavailableError) return failure(409, error.message, "CART_ITEM_UNAVAILABLE");
  reportError?.(error);
  return failure(502, fallback, code);
}
export function createCartController(dependencies: {
  service: CartServicePort;
  isDemoStore: boolean;
  checkoutHosts: readonly string[];
  reportError?: (operation: string, error: unknown) => void;
}) {
  return {
    async get(cartId: string | null): Promise<ApiResult<CartSnapshotDTO>> {
      try {
        const cart = await dependencies.service.getCart(cartId);
        return success(toCartDTO(cart), cartId && !cart.id ? { cartId: null } : undefined);
      } catch (error) {
        dependencies.reportError?.("Cart read failed.", error);
        return failure(502, "Your bag could not be loaded. Please try again.", "CART_READ_FAILED");
      }
    },
    async mutate(cartId: string | null, input: unknown): Promise<ApiResult<CartSnapshotDTO>> {
      const mutation = parseCartMutation(input);
      if (!mutation) return failure(400, "Choose a valid cart action.", "INVALID_CART_INPUT");
      try {
        const cart = await dependencies.service.mutate(cartId, mutation);
        return success(toCartDTO(cart), { cartId: cart.id });
      } catch (error) {
        return mapCartError(error, "Your bag could not be updated. Please try again.", "CART_UPDATE_FAILED", (reason) => dependencies.reportError?.("Cart update failed.", reason));
      }
    },
    async checkout(cartId: string | null): Promise<ApiResult<{ checkoutUrl: string }>> {
      if (dependencies.isDemoStore) return failure(409, "Checkout is not connected in demo mode.", "DEMO_CHECKOUT_UNAVAILABLE");
      try {
        const checkoutUrl = await dependencies.service.getCheckoutUrl(cartId);
        if (!checkoutUrl) return failure(409, "Your bag is empty or has expired.", "CHECKOUT_UNAVAILABLE");
        const target = new URL(checkoutUrl);
        const allowedHosts = new Set(dependencies.checkoutHosts.map((host) => host.toLowerCase()));
        if (target.protocol !== "https:" || target.username || target.password || target.port || !allowedHosts.has(target.hostname.toLowerCase())) {
          throw new Error("Shopify returned a checkout URL outside the configured host allowlist.");
        }
        return success({ checkoutUrl: target.toString() });
      } catch (error) {
        dependencies.reportError?.("Checkout URL request failed.", error);
        return failure(502, "Checkout could not be opened. Please try again.", "CHECKOUT_FAILED");
      }
    },
  };
}

