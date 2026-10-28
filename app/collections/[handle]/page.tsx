import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/frontend/features/catalog/catalog-page";
import { catalogController } from "@/server/domains/storefront/storefront";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ handle: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await catalogController().collection(handle);
  return collection ? { title: collection.title, description: collection.description } : { title: "Collection not found" };
}
export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  const collection = await catalogController().collection(handle);
  if (!collection) notFound();
  return <CatalogPage title={collection.title} description={collection.description} products={collection.products} />;
}
