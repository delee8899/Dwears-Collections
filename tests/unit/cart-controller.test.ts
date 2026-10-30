import assert from "node:assert/strict";
import test from "node:test";
import { createCartController } from "../../src/server/controllers/cart.controller";
import {
  CartInputError,
  CartUnavailableError,
  type Cart,
} from "../../src/server/domains/cart/cart.types";
import type { CartService } from "../../src/server/domains/cart/cart.service";

const cart: Cart = {
  id: "cart-1",
  lines: [
    {
      id: "line-1",
      variantId: "variant-1",
      title: "Vintage jacket",
      variantTitle: "M",
      image: "/jacket.jpg",
      price: "48.00",
      currency: "USD",
      quantity: 1,
      available: true,
    },
  ],
  subtotal: "48.00",
  currency: "USD",
  itemCount: 1,
};
function setup(overrides: Partial<CartService> = {}, isDemoStore = false) {
  const calls: string[] = [];
  const service: CartService = {
    getCart: async () => cart,
    mutate: async () => cart,
    getCheckoutUrl: async () => "https://shop.example/checkout/abc",
    ...overrides,
  };
  return {
    controller: createCartController({
      service,
      isDemoStore,
      checkoutHosts: ["shop.example"],
    }),
    calls,
  };
}

test("cart controller returns a safe cart DTO and no internal cart identifier", async () => {
  const { controller } = setup();
  const result = await controller.get("cart-1");
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    lines: cart.lines,
    subtotal: "48.00",
    currency: "USD",
    itemCount: 1,
  });
  assert.equal("id" in result.body, false);
});

test("cart controller validates input before calling the service", async () => {
  let called = false;
  const { controller } = setup({
    mutate: async () => {
      called = true;
      throw new CartInputError("Choose a valid quantity.");
    },
  });
  const result = await controller.mutate(null, {
    action: "add",
    variantId: "v1",
    quantity: 1,
  });
  assert.equal(result.status, 400);
  assert.equal(called, true);
});

test("cart controller maps unavailable inventory to a conflict result", async () => {
  const { controller } = setup({
    mutate: async () => {
      throw new CartUnavailableError(
        "This one-off piece is no longer available.",
      );
    },
  });
  const result = await controller.mutate(null, {
    action: "add",
    variantId: "variant-1",
    quantity: 1,
  });
  assert.equal(result.status, 409);
  assert.deepEqual(result.body, {
    error: "This one-off piece is no longer available.",
    code: "CART_ITEM_UNAVAILABLE",
  });
});

test("checkout is disabled in demo mode", async () => {
  const { controller } = setup({}, true);
  const result = await controller.checkout(null);
  assert.equal(result.status, 409);
  assert.deepEqual(result.body, {
    error: "Checkout is not connected in demo mode.",
    code: "DEMO_CHECKOUT_UNAVAILABLE",
  });
});

test("checkout only returns a secure Shopify checkout URL", async () => {
  const { controller } = setup();
  assert.deepEqual(await controller.checkout("cart-1"), {
    status: 200,
    body: { checkoutUrl: "https://shop.example/checkout/abc" },
    headers: { "Cache-Control": "no-store" },
  });
  const { controller: insecureController } = setup({
    getCheckoutUrl: async () => "http://example.test/checkout",
  });
  assert.equal((await insecureController.checkout("cart-1")).status, 502);
  const { controller: foreignHostController } = setup({
    getCheckoutUrl: async () => "https://attacker.example/checkout",
  });
  assert.equal((await foreignHostController.checkout("cart-1")).status, 502);
});
