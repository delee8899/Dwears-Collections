import type {
  CustomerAccount,
  CustomerCredential,
  RefreshRotation,
} from "./customer-auth.types";
export interface CustomerAuthRepository {
  createCustomer(email: string, passwordHash: string): Promise<CustomerAccount>;
  findCredentialByEmail(email: string): Promise<CustomerCredential | null>;
  findCustomerById(id: string): Promise<CustomerAccount | null>;
  findCustomerForActiveSession(
    customerId: string,
    sessionId: string,
  ): Promise<CustomerAccount | null>;
  createSession(
    customerId: string,
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  rotateRefreshToken(
    currentTokenHash: string,
    nextTokenHash: string,
    nextExpiresAt: Date,
  ): Promise<RefreshRotation>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
}
