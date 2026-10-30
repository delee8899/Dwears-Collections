export type CustomerAccount = { id: string; email: string; createdAt: Date };
export type CustomerCredential = CustomerAccount & { passwordHash: string };
export type RefreshRotation =
  | { status: "rotated"; customer: CustomerAccount; sessionId: string }
  | { status: "invalid" | "reused" };

export class CustomerAuthError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 401 | 409 | 503,
    readonly code: string,
  ) {
    super(message);
    this.name = "CustomerAuthError";
  }
}
