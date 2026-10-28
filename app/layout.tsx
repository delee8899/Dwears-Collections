import type { Metadata } from "next";
import { SiteFooter } from "@/frontend/shared/components/site-footer";
import { SiteHeader } from "@/frontend/shared/components/site-header";
import { isDemoStore } from "@/server/domains/storefront/storefront";
import "@/frontend/shared/styles/globals.css";
export const metadata:Metadata={title:{default:"Dwears Collections — Good clothes, good stories",template:"%s | Dwears Collections"},description:"Thoughtfully sourced secondhand style. Discover one-of-a-kind vintage and pre-loved pieces at Dwears Collections."};
export default function RootLayout({children}:{children:React.ReactNode}){const demo=isDemoStore();return <html lang="en"><body>{demo&&<div className="demo-banner">Preview store · Sample products and prices · Checkout is not connected</div>}<SiteHeader/>{children}<SiteFooter/></body></html>;}