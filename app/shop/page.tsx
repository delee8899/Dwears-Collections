import type { Metadata } from "next";
import { CatalogPage } from "@/frontend/features/catalog/catalog-page";
import { catalogController } from "@/server/domains/storefront/storefront";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop all", description: "Shop one-of-a-kind thrift and vintage finds from Dwears Collections." };
export default async function ShopPage() {
  const { products, collections } = await catalogController().shop();
  return <CatalogPage products={products} collections={collections} />;
}
