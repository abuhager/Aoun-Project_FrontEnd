import { normalizeApiError } from "@/lib/api/apiError";

export type RefreshFailureKind = "invalid-session" | "temporary-unavailable";

export const classifyRefreshFailure = (error: unknown): RefreshFailureKind => {
  const normalized = normalizeApiError(error);
  if (
    normalized.isNetworkError
    || normalized.status === 429
    || (normalized.status !== null && normalized.status >= 500)
  ) return "temporary-unavailable";
  return "invalid-session";
};
