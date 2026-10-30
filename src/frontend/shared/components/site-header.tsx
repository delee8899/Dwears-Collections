"use client";
import Link from "next/link";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        Curated in small batches <span>✦</span> Every piece has a past. Make it
        yours.
      </div>
      <header className="site-header">
        <button
          className="menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "×" : "☰"}
        </button>
        <Link className="brand" href="/">
          Dwears<small>Collections</small>
        </Link>
        <nav
          className={`nav ${open ? "open" : ""}`}
          aria-label="Main navigation"
        >
          <Link href="/shop" onClick={() => setOpen(false)}>
            Shop all
          </Link>
          <Link href="/collections" onClick={() => setOpen(false)}>
            Categories
          </Link>
          <Link href="/about" onClick={() => setOpen(false)}>
            Our story
          </Link>
          <Link href="/#social" onClick={() => setOpen(false)}>
            #DwearsFinds
          </Link>
          <Link
            className="nav-account-link"
            href="/account/login"
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
          <Link
            className="nav-account-link"
            href="/account/register"
            onClick={() => setOpen(false)}
          >
            Create account
          </Link>
        </nav>
        <div className="header-actions">
          <Link className="account" href="/account/login">
            Sign in
          </Link>
          <Link className="account-create-link" href="/account/register">
            Create account
          </Link>
          <Link className="bag-link" href="/cart" aria-label="Shopping bag">
            Bag
          </Link>
        </div>
      </header>
    </>
  );
}
