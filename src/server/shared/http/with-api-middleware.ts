import { failure } from "./api-result";
import { isSameOriginMutation } from "../../http/request-security";
import { toNextResponse } from "./next-response";

type ApiHandler = (request: Request) => Response | Promise<Response>;
type ApiMiddlewareOptions = { requireSameOrigin?: boolean };

export function withApiMiddleware(
  operation: string,
  handler: ApiHandler,
  options: ApiMiddlewareOptions = {},
): ApiHandler {
  return async (request) => {
    const requestId = globalThis.crypto.randomUUID();
    try {
      const response =
        options.requireSameOrigin && !isSameOriginMutation(request)
          ? toNextResponse(
              failure(
                403,
                "This request could not be verified.",
                "CROSS_ORIGIN_REQUEST",
              ),
            )
          : await handler(request);
      const headers = new Headers(response.headers);
      headers.set("X-Request-Id", requestId);
      headers.set("Cache-Control", "no-store");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      console.error("Unhandled API failure", {
        requestId,
        operation,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      const response = toNextResponse(
        failure(
          500,
          "The request could not be completed. Please try again.",
          "INTERNAL_SERVER_ERROR",
        ),
      );
      const headers = new Headers(response.headers);
      headers.set("X-Request-Id", requestId);
      headers.set("Cache-Control", "no-store");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
  };
}
