import type { Metadata } from "next";
import { CartClient } from "@/frontend/features/cart/cart-client";
import { cartService } from "@/server/domains/storefront/storefront";
import { readCartId } from "@/server/http/cart-cookie";
import { toCartDTO } from "@/server/presenters/storefront-mapper";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Your bag"};
export default async function CartPage(){const cart=await cartService().getCart(await readCartId());return <main className="cart-page"><CartClient initialCart={toCartDTO(cart)}/></main>;}