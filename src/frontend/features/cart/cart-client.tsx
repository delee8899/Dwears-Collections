"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CartMutation, CartSnapshotDTO } from "@/contracts/storefront";
import { formatMoney } from "../../shared/format-money";
export function CartClient({ initialCart }: { initialCart: CartSnapshotDTO }) {
  const [cart, setCart] = useState(initialCart);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function mutate(mutation: CartMutation) {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mutation),
      });
      const value = await response.json();
      if (!response.ok)
        throw new Error(value.error ?? "Could not update your bag.");
      setCart(value);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not update your bag.",
      );
    } finally {
      setPending(false);
    }
  }
  async function checkout() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/cart/checkout", { method: "POST" });
      const value = await response.json();
      if (!response.ok)
        throw new Error(value.error ?? "Checkout is not connected yet.");
      window.location.assign(value.checkoutUrl);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Checkout is not connected yet.",
      );
      setPending(false);
    }
  }
  return (
    <div className="cart-layout">
      <section className="cart-lines">
        <h1>
          Your bag <span>({cart.itemCount})</span>
        </h1>
        {error && (
          <p className="error-note" role="alert">
            {error}
          </p>
        )}
        {cart.lines.length === 0 ? (
          <div className="cart-state">
            <p>Your bag is waiting for something one of a kind.</p>
            <Link className="button" href="/shop">
              Shop the latest <span>→</span>
            </Link>
          </div>
        ) : (
          cart.lines.map((line) => (
            <article className="cart-line" key={line.id}>
              <div className="cart-line-image">
                {line.image && (
                  <Image src={line.image} alt="" fill sizes="110px" />
                )}
              </div>
              <div className="cart-line-content">
                <h2>{line.title}</h2>
                <p>{line.variantTitle}</p>
                <p>
                  {line.available ? "Available now" : "Availability changed"}
                </p>
                <button
                  className="remove-button"
                  disabled={pending}
                  onClick={() =>
                    void mutate({ action: "remove", lineId: line.id })
                  }
                >
                  Remove
                </button>
              </div>
              <div className="cart-line-end">
                <b>{formatMoney(line.price, line.currency)}</b>
                <label>
                  Qty{" "}
                  <select
                    aria-label={`Quantity for ${line.title}`}
                    value={line.quantity}
                    disabled={pending}
                    onChange={(event) =>
                      void mutate({
                        action: "update",
                        lineId: line.id,
                        quantity: Number(event.target.value),
                      })
                    }
                  >
                    <option value={1}>1</option>
                    <option value={0}>Remove</option>
                  </select>
                </label>
              </div>
            </article>
          ))
        )}
      </section>
      {cart.lines.length > 0 && (
        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>{formatMoney(cart.subtotal, cart.currency)}</strong>
          </div>
          <p>Shipping and taxes are calculated at checkout.</p>
          <button
            className="button checkout-button"
            disabled={pending}
            onClick={() => void checkout()}
          >
            {pending ? "Please wait…" : "Continue to checkout"}
            <span>→</span>
          </button>
          <Link className="continue-link" href="/shop">
            Continue shopping
          </Link>
        </aside>
      )}
    </div>
  );
}
