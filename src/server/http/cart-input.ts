import type { CartMutation } from "../domains/cart/cart.types";
const MAX_IDENTIFIER_LENGTH = 512;
function isIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= MAX_IDENTIFIER_LENGTH &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}
export function parseCartMutation(value: unknown): CartMutation | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (
    input.action === "add" &&
    isIdentifier(input.variantId) &&
    Number.isSafeInteger(input.quantity)
  ) {
    return {
      action: "add",
      variantId: input.variantId,
      quantity: input.quantity as number,
    };
  }
  if (
    input.action === "update" &&
    isIdentifier(input.lineId) &&
    Number.isSafeInteger(input.quantity)
  ) {
    return {
      action: "update",
      lineId: input.lineId,
      quantity: input.quantity as number,
    };
  }
  if (input.action === "remove" && isIdentifier(input.lineId))
    return { action: "remove", lineId: input.lineId };
  return null;
}
