import "server-only";
import type { CartRepository } from "../cart/cart.repository";
import { createCartService } from "../cart/cart.service";
import type { CatalogRepository } from "../catalog/catalog.repository";
import { createCatalogService } from "../catalog/catalog.service";
import { createCartController } from "../../controllers/cart.controller";
import { createCatalogController } from "../../controllers/catalog.controller";
import { getStoreConfig } from "../../config/env";
import { createDemoCartRepository } from "../../infrastructure/storefront/demo/demo-cart.repository";
import { demoCatalogRepository } from "../../infrastructure/storefront/demo/demo-catalog.repository";
import { createShopifyCartRepository } from "../../infrastructure/storefront/shopify/shopify-cart.repository";
import { createShopifyCatalogRepository } from "../../infrastructure/storefront/shopify/shopify-catalog.repository";
import { ShopifyClient } from "../../infrastructure/storefront/shopify/shopify-client";
import { getCustomerAuthConfig } from "../../config/customer-auth-env";
import { customerAuthPool } from "../../infrastructure/database/customer-auth-pool";
import { createPostgresCustomerAuthRepository } from "../../infrastructure/database/postgres-customer-auth.repository";
import { createCustomerAuthService } from "../customer-auth/customer-auth.service";
import { CustomerAuthError } from "../customer-auth/customer-auth.types";
let cached: { catalog: CatalogRepository; cart: CartRepository } | undefined;
function repositories() {
  if (cached) return cached;
  const config = getStoreConfig();
  if (config.mode === "demo") {
    cached = {
      catalog: demoCatalogRepository,
      cart: createDemoCartRepository(),
    };
    return cached;
  }
  const client = new ShopifyClient(
    config.domain,
    config.apiVersion,
    config.token,
  );
  cached = {
    catalog: createShopifyCatalogRepository(client),
    cart: createShopifyCartRepository(client),
  };
  return cached;
}
export function catalogService() {
  return createCatalogService(repositories().catalog);
}
export function catalogController() {
  return createCatalogController(catalogService());
}
export function cartService() {
  return createCartService(repositories().cart);
}
export function cartController() {
  const config = getStoreConfig();
  return createCartController({
    service: cartService(),
    isDemoStore: config.mode === "demo",
    checkoutHosts: config.mode === "shopify" ? config.checkoutHosts : [],
    reportError: (operation, error) => console.error(operation, error),
  });
}
export function isDemoStore() {
  return getStoreConfig().mode === "demo";
}

let authService: ReturnType<typeof createCustomerAuthService> | undefined;
export function customerAuthService() {
  if (authService) return authService;
  const config = getCustomerAuthConfig();
  if (
    !config.enabled ||
    !config.accessTokenSecret ||
    !config.refreshTokenSecret
  ) {
    throw new CustomerAuthError(
      "Customer accounts are not available yet.",
      503,
      "AUTH_UNAVAILABLE",
    );
  }
  authService = createCustomerAuthService(
    createPostgresCustomerAuthRepository(customerAuthPool()),
    {
      accessTokenSecret: config.accessTokenSecret,
      refreshTokenSecret: config.refreshTokenSecret,
    },
  );
  return authService;
}
