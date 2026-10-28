# Security notes

## Application protections

- Shopify private credentials remain in server-only modules.
- Shopify cart IDs and customer access/refresh JWTs are stored only in HttpOnly, SameSite=Strict cookies. Production cookies use Secure. Auth responses never include either JWT in JSON.
- Auth, cart, and checkout mutations require a same-origin browser request. JSON bodies are size bounded, and validation occurs before service/repository calls.
- Customer auth uses separate access/refresh HMAC secrets, fixed HS256 verification, issuer/audience/type checks, 10-minute access tokens, and a 30-day maximum session lifetime with rotating refresh tokens. Refresh token hashes are persisted; rotation is transactional, and reuse revokes the whole session. Active access sessions are checked against PostgreSQL, making logout effective immediately.
- Passwords are salted scrypt hashes. Invalid login attempts use a dummy scrypt verification to reduce email enumeration timing differences.
- PostgreSQL values use parameterized queries. Runtime and migration roles should be separate; production DB connections require verified TLS. Auth is disabled unless explicitly enabled and fully configured.
- The shared API middleware adds an `X-Request-Id`, forces `Cache-Control: no-store`, logs only operation/request ID/error class for unexpected failures, and sends a generic error body.
- Checkout URLs require HTTPS and an explicitly allowed Shopify host. Shopify requests do not follow redirects and time out after eight seconds. Raw upstream error text is not exposed.
- External social profile URLs accept only HTTPS TikTok/Instagram hosts. Security response headers disable MIME sniffing/framing, limit referrer detail, and restrict browser capabilities. Production CSP blocks objects and framing.

## Before enabling accounts or launching

1. Provision PostgreSQL and run `npm run db:migrate` with `DATABASE_MIGRATION_URL`. Use a separate least-privilege runtime user in `DATABASE_URL`.
2. Set `AUTH_ENABLED=true`, distinct random `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values of at least 32 bytes, and keep all DB/JWT credentials in a secret manager. Never put them in `NEXT_PUBLIC_` values or logs.
3. Deploy over HTTPS. Production database TLS certificate verification is required; private CA deployments can set `DATABASE_SSL_CA`.
4. Configure edge/platform rate limits for `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/cart`, and `/api/cart/checkout`. Do not rely on in-process limits across serverless or multi-instance deployments.
5. Review proxy and caching rules. Account/cart responses must remain private and uncached; the application sends `Cache-Control: no-store`.
6. Add any Shopify checkout custom domain to `SHOPIFY_CHECKOUT_HOSTS`. Keep the lockfile committed and monitor dependency advisories.

## Account feature limits

This initial release implements email/password accounts and session auth only. It does not include email verification, password recovery, account/profile management, or customer order history. Add those flows before treating registration as a production customer identity system. No frontend login/register forms are included yet.

## Data boundary

PostgreSQL stores customer emails, password hashes, auth sessions, and one-way refresh token hashes. Shopify remains authoritative for products, inventory, cart, checkout, and orders. Demo listings are static source data and demo carts live only in process memory. The browser never connects directly to PostgreSQL. SQL schema changes are versioned under `db/migrations/` and should use a migration-only production credential.

This follows [OWASP database security guidance](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html), [SQL injection prevention guidance](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html), and [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
