import { randomUUID } from "node:crypto";
import type { CartRepository } from "../../../domains/cart/cart.repository";
import { CartUnavailableError, type Cart, type CartLine, type CartMutation } from "../../../domains/cart/cart.types";
import { demoProducts } from "./demo-products";
const carts = new Map<string, CartLine[]>();
const cents = (price:string) => Math.round(Number(price) * 100);
const money = (value:number) => (value / 100).toFixed(2);
function snapshot(id:string|null, lines:CartLine[]):Cart { const currency=lines[0]?.currency ?? "USD"; return {id,lines:[...lines],subtotal:money(lines.reduce((sum,line)=>sum+cents(line.price)*line.quantity,0)),currency,itemCount:lines.reduce((sum,line)=>sum+line.quantity,0)}; }
export function createDemoCartRepository(): CartRepository {
 return {
  async getCart(cartId) { return snapshot(cartId, cartId ? carts.get(cartId) ?? [] : []); },
  async mutateCart(cartId, mutation:CartMutation) {
   const id=cartId ?? randomUUID(); const lines=carts.get(id) ?? [];
   if (mutation.action === "add") {
    const product=demoProducts.find((item)=>item.variants.some((variant)=>variant.id===mutation.variantId && variant.available));
    if (!product) throw new CartUnavailableError("That one-of-a-kind find has already been claimed.");
    const variant=product.variants.find((item)=>item.id===mutation.variantId)!; const existing=lines.find((line)=>line.variantId===variant.id);
    if (existing) existing.quantity=Math.min(1,existing.quantity+mutation.quantity);
    else if (mutation.quantity>0) lines.push({id:randomUUID(),variantId:variant.id,title:product.title,variantTitle:variant.title,image:product.images[0] ?? "",price:variant.price,currency:variant.currency,quantity:1,available:true});
   } else {
    const index=lines.findIndex((line)=>line.id===mutation.lineId); if (index<0) throw new CartUnavailableError("That cart item is no longer available.");
    if (mutation.action === "remove" || mutation.quantity===0) lines.splice(index,1); else lines[index].quantity=1;
   }
   carts.set(id,lines); return snapshot(id,lines);
  },
  async getCheckoutUrl() { return null; },
 };
}