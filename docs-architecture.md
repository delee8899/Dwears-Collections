# Architecture and implementation order

## Separation rules

- `src/server/domains/<domain>/*.types.ts` owns domain entities, input types, and domain errors. It has no framework or vendor imports.
- `src/server/domains/<domain>/*.repository.ts` defines a repository port: what a domain needs from storage, not how storage works.
- `src/server/infrastructure/storefront/<adapter>/` implements those ports for demo data or Shopify. Services never import adapters.
- `src/server/domains/<domain>/*.service.ts` owns business rules and depends only on its repository port.
- `src/server/controllers/` translates application use cases into transport-neutral results, validates request shapes, maps expected errors, and shapes safe response data.
- `src/server/shared/` contains framework-neutral response types and reusable API middleware. `shared/http/next-response.ts` is the Next.js response adapter.
- `app/` contains route handlers and page composition. API routes parse the web request, read/write cookies, call a controller, and adapt its result to `Response`; they contain no domain rules.
- `src/contracts/` contains safe DTOs shared across server-rendered UI and API boundaries. Presenter functions in `src/server/presenters/` map domain data to those DTOs.
- `tests/unit/` tests services and controllers in isolation with in-memory fakes. Tests avoid Shopify, Next.js runtime APIs, and network calls.

## File-by-file implementation sequence (bottom to top)

1. **Contracts and domain language** — `src/contracts/storefront.ts`; `src/server/domains/cart/cart.types.ts`; `src/server/domains/catalog/catalog.types.ts`.
2. **Repository ports** — `src/server/domains/cart/cart.repository.ts`; `src/server/domains/catalog/catalog.repository.ts`.
3. **Storage adapters** — `src/server/infrastructure/storefront/demo/demo-products.ts`, `demo-catalog.repository.ts`, `demo-cart.repository.ts`; then `shopify/shopify-client.ts`, `shopify-queries.ts`, `shopify-mappers.ts`, `shopify-catalog.repository.ts`, `shopify-cart.repository.ts`.
4. **Business services** — `src/server/domains/catalog/catalog.service.ts`; `src/server/domains/cart/cart.service.ts`. Unit test cart rules in `tests/unit/cart-service.test.ts`.
5. **Safe presentation and shared transport types** — `src/server/presenters/storefront-mapper.ts`; `src/server/shared/http/api-result.ts`; `src/server/shared/http/next-response.ts`.
6. **Input and request state helpers** — `src/server/http/cart-input.ts`; `src/server/http/cart-cookie.ts`.
7. **Controllers** — `src/server/controllers/catalog.controller.ts` and `cart.controller.ts`. Catalog page data and cart use cases live here, above services and below routes. Test DTO mapping in `tests/unit/catalog-controller.test.ts`; test validation, error mapping, demo checkout, and secure checkout URLs in `tests/unit/cart-controller.test.ts`.
8. **Composition root** — `src/server/domains/storefront/storefront.ts` selects adapters, builds services, and injects them into controllers.
9. **HTTP routes** — `app/api/cart/route.ts`; `app/api/cart/checkout/route.ts`. Keep these as thin Next.js adapters.
10. **Pages and feature UI** — `app/layout.tsx`, `app/page.tsx`, `app/shop/page.tsx`, `app/collections/[handle]/page.tsx`, `app/products/[handle]/page.tsx`, `app/cart/page.tsx`, then `src/frontend/features/` and `src/frontend/shared/`.
11. **Operational checks** — `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

## Unit tests

Run `npm test`. The tests use Node's built-in test runner. `tsconfig.test.json` compiles only test targets and their dependencies into `.test-build/`, which is ignored by Git; no external test package is required.


