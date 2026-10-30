import type { CatalogRepository } from "../../../domains/catalog/catalog.repository";
import { demoCollections, demoProducts } from "./demo-products";
export const demoCatalogRepository: CatalogRepository = {
  async listProducts() {
    return demoProducts;
  },
  async getProduct(handle) {
    return demoProducts.find((product) => product.handle === handle) ?? null;
  },
  async listCollections() {
    return demoCollections;
  },
  async getCollection(handle) {
    const collection = demoCollections.find((item) => item.handle === handle);
    if (!collection) return null;
    return {
      collection,
      products: demoProducts.filter((product) =>
        product.collectionHandles.includes(handle),
      ),
    };
  },
};
