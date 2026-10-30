export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413 | 415; error: string; code: string };

export async function readJsonBody(
  request: Request,
  maximumBytes = 4_096,
  subject = "cart request",
): Promise<JsonBodyResult> {
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    return {
      ok: false,
      status: 415,
      error: "Use application/json for the " + subject + ".",
      code: "UNSUPPORTED_MEDIA_TYPE",
    };
  }
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null && Number(contentLength) > maximumBytes) {
    return {
      ok: false,
      status: 413,
      error: "The " + subject + " is too large.",
      code: "REQUEST_TOO_LARGE",
    };
  }
  if (!request.body)
    return {
      ok: false,
      status: 400,
      error: "Send valid JSON for the " + subject + ".",
      code: "INVALID_JSON",
    };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        return {
          ok: false,
          status: 413,
          error: "The " + subject + " is too large.",
          code: "REQUEST_TOO_LARGE",
        };
      }
      chunks.push(value);
    }
  } catch {
    return {
      ok: false,
      status: 400,
      error: "Send valid JSON for the " + subject + ".",
      code: "INVALID_JSON",
    };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      status: 400,
      error: "Send valid JSON for the " + subject + ".",
      code: "INVALID_JSON",
    };
  }
}

export function isSameOriginMutation(request: Request): boolean {
  if (request.headers.get("sec-fetch-site")?.toLowerCase() === "cross-site")
    return false;
  const origin = request.headers.get("origin");
  if (!origin)
    return (
      request.headers.get("sec-fetch-site")?.toLowerCase() === "same-origin"
    );
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
