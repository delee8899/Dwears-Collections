import { HomePage } from "@/frontend/features/home/home-page";
import { catalogController } from "@/server/domains/storefront/storefront";
export const dynamic = "force-dynamic";
export default async function Page() {
  const { products, collections } = await catalogController().home();
  return <HomePage products={products} collections={collections} />;
}
