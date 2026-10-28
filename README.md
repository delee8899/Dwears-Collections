# Dwears Collections storefront

Custom coded storefront with a feature-based frontend and domain-based backend. `../index.html` in the parent outputs folder is the original visual prototype.

## Run in demo mode

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` (or rely on `STORE_MODE=demo`).
3. Run `npm run dev` and open `http://localhost:3000`.

Demo products and cart interactions are sample data. Demo checkout intentionally returns an unavailable message and does not take payment. The demo cart is kept in process memory and resets when the dev server restarts.

## Customer accounts

Accounts are disabled by default. To enable local accounts for development, provision a PostgreSQL database, set `AUTH_ENABLED=true`, set `DATABASE_URL`, and set different cryptographically random `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values (at least 32 bytes each). Run `npm run db:migrate`, then start the app. Use a separate least-privilege runtime database role and migration role in production. Production requires verified database TLS.

Auth endpoints are `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh`, and `/api/auth/logout`. Access and refresh JWTs are sent only as HttpOnly, SameSite=Strict cookies; endpoint JSON never contains either token. Access tokens last 10 minutes. Sessions expire no later than 30 days after sign-in; refresh tokens rotate but do not extend that session lifetime. Reuse of a consumed refresh token revokes its session. `GET /api/auth/me` checks the session against PostgreSQL, so logout disables access immediately. Passwords require 12–128 characters and are stored as salted scrypt hashes.

This first account release has no email verification, password recovery, profile editing, or frontend sign-in screens. The API foundation is ready for those features to be added separately.

## Connect Shopify

Set `STORE_MODE=shopify`, `SHOPIFY_STORE_DOMAIN`, and `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` in the server environment. Pin `SHOPIFY_STOREFRONT_API_VERSION` to a supported version. Keep the private token out of browser variables and source control. Create a product metafield definition `custom.condition` to provide the condition label; without it the storefront uses a generic condition note. Shopify owns product inventory, cart, checkout, and orders.

## Structure

- `app/`: page composition and route handlers.
- `src/frontend/features/`: shopper-facing home, catalog, product, and cart features.
- `src/server/domains/`: catalog, cart, and customer-auth business types, repository ports, and services.
- `src/server/controllers/`: framework-neutral API use cases.
- `src/server/shared/`: reusable API result and middleware.
- `src/server/infrastructure/`: demo, Shopify, and PostgreSQL adapters.
- `src/server/auth/`: JWT signing/verification and password hashing.
- `db/migrations/`: versioned schema migrations.
- `tests/unit/`: isolated service and controller tests.

See `docs-architecture.md` for separation-of-concerns rules. Run `npm test` for the unit suite. Security and deployment requirements are in `SECURITY.md`.

## Social links

Optionally set `NEXT_PUBLIC_TIKTOK_URL` and `NEXT_PUBLIC_INSTAGRAM_URL` to the official Dwears profile URLs. Unconfigured profiles are omitted.
