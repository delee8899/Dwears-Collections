import "server-only";
export class ShopifyClient {
  private readonly endpoint: string;
  constructor(
    domain: string,
    version: string,
    private readonly token: string,
  ) {
    this.endpoint = `https://${domain}/api/${version}/graphql.json`;
  }
  async request<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
      headers: {
        "Content-Type": "application/json",
        "Shopify-Storefront-Private-Token": this.token,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok)
      throw new Error(
        `Shopify Storefront API returned HTTP ${response.status}.`,
      );
    const payload = (await response.json()) as {
      data?: T;
      errors?: { message: string }[];
    };
    if (payload.errors?.length || !payload.data) {
      throw new Error(
        payload.errors?.length
          ? "Shopify rejected the storefront request."
          : "Shopify returned an empty response.",
      );
    }
    return payload.data;
  }
}
