import { readJsonBody } from "./request-security";
export type CredentialsResult =
  | { ok: true; email: string; password: string }
  | { ok: false; status: 400 | 413 | 415; error: string; code: string };
export async function readCustomerCredentials(
  request: Request,
): Promise<CredentialsResult> {
  const parsed = await readJsonBody(request, 4_096, "account request");
  if (!parsed.ok) return parsed;
  if (
    typeof parsed.value !== "object" ||
    parsed.value === null ||
    Array.isArray(parsed.value)
  ) {
    return {
      ok: false,
      status: 400,
      error: "Send an email address and password.",
      code: "INVALID_CREDENTIALS",
    };
  }
  const record = parsed.value as Record<string, unknown>;
  if (
    typeof record.email !== "string" ||
    record.email.length > 254 ||
    typeof record.password !== "string" ||
    record.password.length > 128 ||
    Buffer.byteLength(record.password, "utf8") > 1_024
  ) {
    return {
      ok: false,
      status: 400,
      error: "Send an email address and password within the allowed limits.",
      code: "INVALID_CREDENTIALS",
    };
  }
  return { ok: true, email: record.email, password: record.password };
}
