import assert from "node:assert/strict";
import test from "node:test";
import { createCartService } from "../../src/server/domains/cart/cart.service";
import { type Cart, type CartMutation } from "../../src/server/domains/cart/cart.types";
import type { CartRepository } from "../../src/server/domains/cart/cart.repository";

const emptyCart: Cart = { id: "cart-1", lines: [], subtotal: "0.00", currency: "USD", itemCount: 0 };
function setup() {
  const calls: CartMutation[] = [];
  const repository: CartRepository = {
    getCart: async () => emptyCart,
    mutateCart: async (_cartId, mutation) => { calls.push(mutation); return emptyCart; },
    getCheckoutUrl: async () => null,
  };
  return { service: createCartService(repository), calls };
}

test("cart service rejects add quantities outside one-item limits before repository access", async () => {
  const { service, calls } = setup();
  assert.throws(() => service.mutate(null, { action: "add", variantId: "v1", quantity: 0 }), { name: "CartInputError" });
  assert.throws(() => service.mutate(null, { action: "add", variantId: "v1", quantity: 2 }), { name: "CartInputError" });
  assert.equal(calls.length, 0);
});

test("cart service rejects blank add variants and blank line identifiers", async () => {
  const { service, calls } = setup();
  assert.throws(() => service.mutate(null, { action: "add", variantId: "  ", quantity: 1 }), { name: "CartInputError" });
  assert.throws(() => service.mutate(null, { action: "remove", lineId: " " }), { name: "CartInputError" });
  assert.equal(calls.length, 0);
});

test("cart service accepts a valid mutation and delegates it unchanged", async () => {
  const { service, calls } = setup();
  const mutation: CartMutation = { action: "update", lineId: "line-1", quantity: 1 };
  await service.mutate("cart-1", mutation);
  assert.deepEqual(calls, [mutation]);
});





