import type {
  CollectionDTO,
  StoreProductDTO,
} from "../../contracts/storefront";
import type { CatalogService } from "../domains/catalog/catalog.service";
import { toCollectionDTO, toProductDTO } from "../presenters/storefront-mapper";

type CatalogServicePort = Pick<
  CatalogService,
  "listProducts" | "getProduct" | "listCollections" | "getCollection"
>;
export function createCatalogController(service: CatalogServicePort) {
  return {
    async home(): Promise<{
      products: StoreProductDTO[];
      collections: CollectionDTO[];
    }> {
      const [products, collections] = await Promise.all([
        service.listProducts(),
        service.listCollections(),
      ]);
      return {
        products: products.map(toProductDTO),
        collections: collections.map(toCollectionDTO),
      };
    },
    async shop(): Promise<{
      products: StoreProductDTO[];
      collections: CollectionDTO[];
    }> {
      const [products, collections] = await Promise.all([
        service.listProducts(),
        service.listCollections(),
      ]);
      return {
        products: products.map(toProductDTO),
        collections: collections.map(toCollectionDTO),
      };
    },
    async product(handle: string): Promise<StoreProductDTO | null> {
      const product = await service.getProduct(handle);
      return product ? toProductDTO(product) : null;
    },
    async collection(
      handle: string,
    ): Promise<{
      title: string;
      description: string;
      products: StoreProductDTO[];
    } | null> {
      const result = await service.getCollection(handle);
      return result
        ? {
            title: result.collection.title,
            description: result.collection.description,
            products: result.products.map(toProductDTO),
          }
        : null;
    },
  };
}
