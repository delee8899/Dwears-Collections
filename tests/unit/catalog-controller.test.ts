import assert from "node:assert/strict";
import test from "node:test";
import { createCatalogController } from "../../src/server/controllers/catalog.controller";
import type { CatalogService } from "../../src/server/domains/catalog/catalog.service";
import type {
  StoreCollection,
  StoreProduct,
} from "../../src/server/domains/catalog/catalog.types";
const product: StoreProduct = {
  id: "jacket-1",
  handle: "olive-jacket",
  title: "Olive Jacket",
  description: "A vintage jacket.",
  condition: "Very good",
  images: ["/jacket.jpg"],
  price: "48.00",
  currency: "USD",
  available: true,
  collectionHandles: ["jackets"],
  variants: [
    {
      id: "variant-1",
      title: "M",
      available: true,
      price: "48.00",
      currency: "USD",
      options: [{ name: "Size", value: "M" }],
    },
  ],
};
const collection: StoreCollection = {
  handle: "jackets",
  title: "Jackets",
  description: "Layers with history.",
  image: "/jacket.jpg",
  productCount: 1,
};
function setup(): CatalogService {
  return {
    listProducts: async () => [product],
    getProduct: async (handle) => (handle === product.handle ? product : null),
    listCollections: async () => [collection],
    getCollection: async (handle) =>
      handle === collection.handle ? { collection, products: [product] } : null,
  };
}
test("catalog controller returns shopper-safe catalog DTOs", async () => {
  const result = await createCatalogController(setup()).home();
  assert.equal(result.products[0].title, "Olive Jacket");
  assert.equal(result.collections[0].handle, "jackets");
  assert.equal("collectionHandles" in result.products[0], false);
});
test("catalog controller maps missing products and collections to null", async () => {
  const controller = createCatalogController(setup());
  assert.equal(await controller.product("missing"), null);
  assert.equal(await controller.collection("missing"), null);
});
