import type { CartRepository } from "./cart.repository";
import { CartInputError, type CartMutation } from "./cart.types";
export const MAX_CART_LINE_QUANTITY = 1;
export function createCartService(repository: CartRepository) {
  return {
    getCart: (cartId: string | null) => repository.getCart(cartId),
    mutate: (cartId: string | null, mutation: CartMutation) => {
      if (mutation.action !== "remove") {
        const minimum = mutation.action === "add" ? 1 : 0;
        if (
          !Number.isSafeInteger(mutation.quantity) ||
          mutation.quantity < minimum ||
          mutation.quantity > MAX_CART_LINE_QUANTITY
        ) {
          throw new CartInputError(
            "Each pre-loved find is a one-off; add only one of each item.",
          );
        }
      }
      if (
        mutation.action === "add" &&
        (!mutation.variantId.trim() || mutation.variantId.length > 512)
      ) {
        throw new CartInputError(
          "Choose an item option before adding it to your bag.",
        );
      }
      if (
        mutation.action !== "add" &&
        (!mutation.lineId.trim() || mutation.lineId.length > 512)
      ) {
        throw new CartInputError("That cart item could not be found.");
      }
      return repository.mutateCart(cartId, mutation);
    },
    getCheckoutUrl: (cartId: string | null) =>
      repository.getCheckoutUrl(cartId),
  };
}
export type CartService = ReturnType<typeof createCartService>;
