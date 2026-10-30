import type {
  CustomerSessionTokens,
  CustomerAuthService,
} from "../domains/customer-auth/customer-auth.service";
import { CustomerAuthError } from "../domains/customer-auth/customer-auth.types";
import { failure, success, type ApiResult } from "../shared/http/api-result";

type AuthPayload = {
  customer: { id: string; email: string; createdAt: string };
};
type ControllerOutput = {
  response: ApiResult<AuthPayload | { loggedOut: true }>;
  cookieTokens?: CustomerSessionTokens;
  clearCookies?: boolean;
};
function customerDto(customer: { id: string; email: string; createdAt: Date }) {
  return {
    id: customer.id,
    email: customer.email,
    createdAt: customer.createdAt.toISOString(),
  };
}
async function safely(
  action: () => Promise<ControllerOutput>,
): Promise<ControllerOutput> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof CustomerAuthError)
      return { response: failure(error.status, error.message, error.code) };
    throw error;
  }
}
export function createCustomerAuthController(service: CustomerAuthService) {
  return {
    register: (email: string, password: string) =>
      safely(async () => {
        const result = await service.register(email, password);
        return {
          response: success({ customer: customerDto(result.customer) }),
          cookieTokens: result.tokens,
        };
      }),
    login: (email: string, password: string) =>
      safely(async () => {
        const result = await service.login(email, password);
        return {
          response: success({ customer: customerDto(result.customer) }),
          cookieTokens: result.tokens,
        };
      }),
    refresh: (token: string | null) =>
      safely(async () => {
        const result = await service.refresh(token);
        return {
          response: success({ customer: customerDto(result.customer) }),
          cookieTokens: result.tokens,
        };
      }),
    me: (token: string | null) =>
      safely(async () => ({
        response: success({
          customer: customerDto(await service.authenticate(token)),
        }),
      })),
    logout: (token: string | null) =>
      safely(async () => {
        await service.logout(token);
        return { response: success({ loggedOut: true }), clearCookies: true };
      }),
  };
}
