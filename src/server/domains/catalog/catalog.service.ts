import type { CatalogRepository } from "./catalog.repository";
export function createCatalogService(repository: CatalogRepository) {
  return {
    listProducts: () => repository.listProducts(),
    getProduct: (handle: string) => repository.getProduct(handle),
    listCollections: () => repository.listCollections(),
    getCollection: (handle: string) => repository.getCollection(handle),
  };
}
export type CatalogService = ReturnType<typeof createCatalogService>;
