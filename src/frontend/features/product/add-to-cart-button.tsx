"use client";
import { useState } from "react";
import type { ProductVariantDTO } from "@/contracts/storefront";
export function AddToCartButton({
  variant,
}: {
  variant: ProductVariantDTO | undefined;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function add() {
    if (!variant || !variant.available) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          variantId: variant.id,
          quantity: 1,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Could not add this item.");
      setMessage("Added to your bag.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="add-cart-wrap">
      <button
        className="button"
        disabled={!variant?.available || busy}
        onClick={add}
      >
        {busy ? "Adding…" : variant?.available ? "Add to bag" : "Sold out"}
        <span>→</span>
      </button>
      <span className="sr-only" role="status">
        {message}
      </span>
      {message && (
        <p className="inline-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
