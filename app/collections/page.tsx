import type { Metadata } from "next";
import { CollectionsPage } from "@/frontend/features/catalog/collections-page";
import { catalogController } from "@/server/domains/storefront/storefront";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shop by category",
  description: "Browse Dwears Collections thrift and vintage pieces by category.",
};

export default async function CollectionsIndexPage() {
  const { collections } = await catalogController().shop();
  return <CollectionsPage collections={collections} />;
}
