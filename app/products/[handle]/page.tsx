import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/frontend/features/product/product-page";
import { catalogController } from "@/server/domains/storefront/storefront";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ handle: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await catalogController().product(handle);
  return product ? { title: product.title, description: product.description } : { title: "Item not found" };
}
export default async function ProductRoute({ params }: Props) {
  const { handle } = await params;
  const product = await catalogController().product(handle);
  if (!product) notFound();
  return <ProductPage product={product} />;
}
