import {
  CartUnavailableError,
  type CartMutation,
} from "../../../domains/cart/cart.types";
import type { CartRepository } from "../../../domains/cart/cart.repository";
import { mapCart } from "./shopify-mappers";
import {
  ADD_CART_LINES,
  CREATE_CART,
  GET_CART,
  GET_CHECKOUT,
  REMOVE_CART_LINES,
  UPDATE_CART_LINES,
} from "./shopify-queries";
import type { ShopifyClient } from "./shopify-client";
type RawCart = Parameters<typeof mapCart>[0];
type CartPayload = { cart: RawCart | null; userErrors?: { message: string }[] };
function assertNoErrors(errors: CartPayload["userErrors"]) {
  if (errors?.length)
    throw new CartUnavailableError(
      "This item could not be added to your bag. Check availability and try again.",
    );
}
export function createShopifyCartRepository(
  client: ShopifyClient,
): CartRepository {
  return {
    async getCart(cartId) {
      if (!cartId)
        return {
          id: null,
          lines: [],
          subtotal: "0.00",
          currency: "USD",
          itemCount: 0,
        };
      const result = await client.request<{ cart: RawCart | null }>(GET_CART, {
        id: cartId,
      });
      return result.cart
        ? mapCart(result.cart)
        : {
            id: null,
            lines: [],
            subtotal: "0.00",
            currency: "USD",
            itemCount: 0,
          };
    },
    async mutateCart(cartId, mutation: CartMutation) {
      let result: CartPayload;
      if (mutation.action === "add") {
        const lines = [
          { merchandiseId: mutation.variantId, quantity: mutation.quantity },
        ];
        result = cartId
          ? await client
              .request<{
                cartLinesAdd: CartPayload;
              }>(ADD_CART_LINES, { cartId, lines })
              .then((value) => value.cartLinesAdd)
          : await client
              .request<{ cartCreate: CartPayload }>(CREATE_CART, { lines })
              .then((value) => value.cartCreate);
      } else {
        if (!cartId)
          throw new CartUnavailableError(
            "Your bag has expired. Please add the item again.",
          );
        result =
          mutation.action === "remove"
            ? await client
                .request<{
                  cartLinesRemove: CartPayload;
                }>(REMOVE_CART_LINES, { cartId, lineIds: [mutation.lineId] })
                .then((value) => value.cartLinesRemove)
            : await client
                .request<{
                  cartLinesUpdate: CartPayload;
                }>(UPDATE_CART_LINES, { cartId, lines: [{ id: mutation.lineId, quantity: mutation.quantity }] })
                .then((value) => value.cartLinesUpdate);
      }
      assertNoErrors(result.userErrors);
      if (!result.cart)
        throw new CartUnavailableError(
          "Shopify could not update your bag. Please try again.",
        );
      return mapCart(result.cart);
    },
    async getCheckoutUrl(cartId) {
      if (!cartId) return null;
      const result = await client.request<{
        cart: { checkoutUrl: string } | null;
      }>(GET_CHECKOUT, { id: cartId });
      return result.cart?.checkoutUrl ?? null;
    },
  };
}
