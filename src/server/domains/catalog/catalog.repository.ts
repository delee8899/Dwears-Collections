import type { StoreCollection, StoreProduct } from "./catalog.types";
export interface CatalogRepository {
  listProducts(): Promise<StoreProduct[]>;
  getProduct(handle: string): Promise<StoreProduct | null>;
  listCollections(): Promise<StoreCollection[]>;
  getCollection(
    handle: string,
  ): Promise<{ collection: StoreCollection; products: StoreProduct[] } | null>;
}
