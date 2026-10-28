import { NextResponse } from "next/server";
import type { ApiResult } from "./api-result";
export function toNextResponse<T>(result: ApiResult<T>) {
  return NextResponse.json(result.body, { status: result.status, headers: result.headers });
}
