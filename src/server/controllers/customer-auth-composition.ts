import { customerAuthService } from "../domains/storefront/storefront";
import { createCustomerAuthController } from "./customer-auth.controller";
export function customerAuthController() { return createCustomerAuthController(customerAuthService()); }
