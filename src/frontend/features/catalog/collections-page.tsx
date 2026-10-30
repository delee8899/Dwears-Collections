import Image from "next/image";
import Link from "next/link";
import type { CollectionDTO } from "@/contracts/storefront";

export function CollectionsPage({
  collections,
}: {
  collections: CollectionDTO[];
}) {
  return (
    <main className="catalog-page">
      <div className="page-intro">
        <div className="eyebrow">Browse the rails</div>
        <h1>Shop by category</h1>
        <p>
          Explore every kind of find, from easy everyday pieces to the little
          details that finish a look.
        </p>
      </div>
      {collections.length ? (
        <div className="category-grid collections-directory">
          {collections.map((collection) => (
            <Link
              className="category-card"
              key={collection.handle}
              href={`/collections/${collection.handle}`}
            >
              {collection.image && (
                <Image
                  src={collection.image}
                  alt=""
                  fill
                  sizes="(max-width:650px) 45vw, 23vw"
                />
              )}
              {!collection.image && (
                <span className="image-placeholder" aria-hidden="true" />
              )}
              <div className="category-label">
                <strong>{collection.title}</strong>
                <span>
                  {collection.productCount}{" "}
                  {collection.productCount === 1 ? "piece" : "pieces"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="empty-note">
          New categories are on their way. Browse{" "}
          <Link className="text-link" href="/shop">
            all available pieces
          </Link>
          .
        </p>
      )}
    </main>
  );
}
