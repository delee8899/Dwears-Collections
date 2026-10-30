export type ApiErrorBody = { error: string; code: string };
export type ApiResult<T> = {
  status: number;
  body: T | ApiErrorBody;
  headers?: Record<string, string>;
  effects?: { cartId?: string | null };
};
export function success<T>(
  body: T,
  effects?: ApiResult<T>["effects"],
): ApiResult<T> {
  return {
    status: 200,
    body,
    headers: { "Cache-Control": "no-store" },
    ...(effects ? { effects } : {}),
  };
}
export function failure<T = never>(
  status: number,
  error: string,
  code: string,
): ApiResult<T> {
  return {
    status,
    body: { error, code },
    headers: { "Cache-Control": "no-store" },
  };
}
