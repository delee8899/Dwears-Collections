import assert from "node:assert/strict";
import test from "node:test";
import { demoCatalogRepository } from "../../src/server/infrastructure/storefront/demo/demo-catalog.repository";

test("demo catalog repository finds products by handle and returns null for misses", async () => {
  assert.equal(
    (await demoCatalogRepository.getProduct("olive-utility-jacket"))?.title,
    "Olive Utility Jacket",
  );
  assert.equal(await demoCatalogRepository.getProduct("not-a-real-item"), null);
});

test("demo catalog repository scopes collection products to the selected collection", async () => {
  const result = await demoCatalogRepository.getCollection("jackets");
  assert.equal(result?.collection.handle, "jackets");
  assert.equal(result?.products.length, 2);
  assert.ok(
    result?.products.every((product) =>
      product.collectionHandles.includes("jackets"),
    ),
  );
  assert.equal(await demoCatalogRepository.getCollection("missing"), null);
});
