import type { Cart } from "../domains/cart/cart.types";
import type {
  StoreCollection,
  StoreProduct,
} from "../domains/catalog/catalog.types";
import type {
  CartSnapshotDTO,
  CollectionDTO,
  StoreProductDTO,
} from "../../contracts/storefront";
export const toProductDTO = (product: StoreProduct): StoreProductDTO => ({
  id: product.id,
  handle: product.handle,
  title: product.title,
  description: product.description,
  condition: product.condition,
  images: product.images,
  price: product.price,
  currency: product.currency,
  available: product.available,
  variants: product.variants.map(
    ({ id, title, available, price, currency, options }) => ({
      id,
      title,
      available,
      price,
      currency,
      options,
    }),
  ),
});
export const toCollectionDTO = (
  collection: StoreCollection,
): CollectionDTO => ({ ...collection });
export const toCartDTO = (cart: Cart): CartSnapshotDTO => ({
  lines: cart.lines,
  subtotal: cart.subtotal,
  currency: cart.currency,
  itemCount: cart.itemCount,
});
