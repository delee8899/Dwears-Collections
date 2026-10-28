export type CartLine = { id: string; variantId: string; title: string; variantTitle: string; image: string; price: string; currency: string; quantity: number; available: boolean };
export type Cart = { id: string | null; lines: CartLine[]; subtotal: string; currency: string; itemCount: number };
export type CartMutation = { action: "add"; variantId: string; quantity: number } | { action: "update"; lineId: string; quantity: number } | { action: "remove"; lineId: string };
export class CartInputError extends Error { constructor(message: string, readonly code = "INVALID_CART_INPUT") { super(message); this.name = "CartInputError"; } }
export class CartUnavailableError extends Error { constructor(message: string) { super(message); this.name = "CartUnavailableError"; } }