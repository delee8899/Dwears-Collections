export type StoreProductDTO = { id: string; handle: string; title: string; description: string; condition: string; images: string[]; price: string; currency: string; available: boolean; variants: ProductVariantDTO[] };
export type ProductVariantDTO = { id: string; title: string; available: boolean; price: string; currency: string; options: { name: string; value: string }[] };
export type CollectionDTO = { handle: string; title: string; description: string; image: string; productCount: number };
export type CartLineDTO = { id: string; variantId: string; title: string; variantTitle: string; image: string; price: string; currency: string; quantity: number; available: boolean };
export type CartSnapshotDTO = { lines: CartLineDTO[]; subtotal: string; currency: string; itemCount: number };
export type CartMutation = { action: "add"; variantId: string; quantity: number } | { action: "update"; lineId: string; quantity: number } | { action: "remove"; lineId: string };