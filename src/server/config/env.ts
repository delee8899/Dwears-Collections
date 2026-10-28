import "server-only";
type ShopifyConfig = { mode: "shopify"; domain: string; token: string; apiVersion: string; checkoutHosts: string[] };
export type StoreConfig = { mode: "demo" } | ShopifyConfig;

const SHOPIFY_DOMAIN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;
const PUBLIC_HOST = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const STOREFRONT_VERSION = /^\d{4}-(01|04|07|10)$/;

export function getStoreConfig(): StoreConfig {
  const mode = process.env.STORE_MODE ?? "demo";
  if (mode !== "demo" && mode !== "shopify") throw new Error("STORE_MODE must be either 'demo' or 'shopify'.");
  if (mode === "demo") return { mode };

  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim().toLowerCase();
  const token = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim();
  const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "2026-10";
  if (!domain || !token) throw new Error("Shopify mode needs SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_PRIVATE_TOKEN.");
  if (!SHOPIFY_DOMAIN.test(domain)) throw new Error("SHOPIFY_STORE_DOMAIN must be a myshopify.com domain.");
  if (!STOREFRONT_VERSION.test(apiVersion)) throw new Error("SHOPIFY_STOREFRONT_API_VERSION must use a quarterly YYYY-MM version.");

  const configuredHosts = (process.env.SHOPIFY_CHECKOUT_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  if (configuredHosts.some((host) => !PUBLIC_HOST.test(host))) {
    throw new Error("SHOPIFY_CHECKOUT_HOSTS must contain comma-separated public hostnames without schemes or paths.");
  }
  return { mode, domain, token, apiVersion, checkoutHosts: [...new Set([domain, ...configuredHosts])] };
}
