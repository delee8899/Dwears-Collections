import type { CatalogRepository } from "../../../domains/catalog/catalog.repository";
import type { StoreProduct } from "../../../domains/catalog/catalog.types";
import {
  mapCollection,
  mapProduct,
  type RawCollection,
} from "./shopify-mappers";
import {
  GET_COLLECTION,
  GET_PRODUCT,
  LIST_COLLECTIONS,
  LIST_PRODUCTS,
} from "./shopify-queries";
import type { ShopifyClient } from "./shopify-client";
type Connection<T> = { nodes: T[] };
type RawProduct = Parameters<typeof mapProduct>[0];
export function createShopifyCatalogRepository(
  client: ShopifyClient,
): CatalogRepository {
  return {
    async listProducts() {
      const result = await client.request<{ products: Connection<RawProduct> }>(
        LIST_PRODUCTS,
      );
      return result.products.nodes.map(mapProduct);
    },
    async getProduct(handle) {
      const result = await client.request<{ product: RawProduct | null }>(
        GET_PRODUCT,
        { handle },
      );
      return result.product ? mapProduct(result.product) : null;
    },
    async listCollections() {
      const result = await client.request<{
        collections: { nodes: RawCollection[] };
      }>(LIST_COLLECTIONS);
      return result.collections.nodes.map(mapCollection);
    },
    async getCollection(handle) {
      const result = await client.request<{ collection: RawCollection | null }>(
        GET_COLLECTION,
        { handle },
      );
      if (!result.collection) return null;
      return {
        collection: mapCollection(result.collection),
        products: result.collection.products.nodes.map(mapProduct),
      };
    },
  };
}
export type { StoreProduct };
