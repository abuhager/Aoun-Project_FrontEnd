import "server-only";
import { cache } from "react";

import type { ItemsListResponse, ItemFilters, Item } from "@/types/item.types";
import type { SafeHub } from "@/types/hub.types";
import type {
  DonationRequest,
  DonationRequestsListResponse,
  GetDonationRequestsParams,
} from "@/types/donationRequest.types";
import type { PublicSettings } from "@/types/settings.types";

type PublicFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

const getServerApiTimeoutMs = () => {
  const parsed = Number(process.env.SERVER_API_TIMEOUT_MS ?? 10_000);
  if (!Number.isFinite(parsed)) return 10_000;
  return Math.min(30_000, Math.max(1_000, Math.floor(parsed)));
};

const getBackendOrigin = () => {
  const raw = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!raw?.trim()) {
    throw new Error("BACKEND_URL is required for server-side public API requests");
  }

  const url = new URL(raw.trim());
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error("BACKEND_URL must use HTTP or HTTPS");
  }

  return url.origin;
};

const toQueryString = (values: Record<string, unknown>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
};

async function publicApiFetch<T>(
  path: string,
  { revalidate = 30, tags = [] }: PublicFetchOptions = {}
): Promise<T> {
  const response = await fetch(`${getBackendOrigin()}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(getServerApiTimeoutMs()),
    cache: revalidate === false ? "no-store" : undefined,
    next:
      revalidate === false
        ? undefined
        : {
            revalidate,
            tags,
          },
  });

  if (!response.ok) {
    throw new Error(`Public API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export const getPublicItemsServer = (
  filters: ItemFilters = {},
  options: PublicFetchOptions = {}
) =>
  publicApiFetch<ItemsListResponse>(
    `/api/items${toQueryString(filters as Record<string, unknown>)}`,
    { revalidate: 30, tags: ["public-items"], ...options }
  );

export const getPublicItemServer = cache((id: string) =>
  publicApiFetch<Item>(`/api/items/${encodeURIComponent(id)}`, {
    revalidate: false,
  }));

export const getPublicHubsServer = cache(() =>
  publicApiFetch<SafeHub[]>("/api/hubs", {
    revalidate: 300,
    tags: ["public-hubs"],
  }));

export const getPublicSettingsServer = cache(() =>
  publicApiFetch<PublicSettings>("/api/settings/public", {
    revalidate: 60,
    tags: ["public-settings"],
  }));

export const getPublicDonationRequestsServer = (
  params: GetDonationRequestsParams = {},
  options: PublicFetchOptions = {}
) =>
  publicApiFetch<DonationRequestsListResponse>(
    `/api/donation-requests${toQueryString(params as Record<string, unknown>)}`,
    { revalidate: 20, tags: ["public-donation-requests"], ...options }
  );

export const getPublicDonationRequestServer = cache((id: string) =>
  publicApiFetch<{ request: DonationRequest }>(
    `/api/donation-requests/${encodeURIComponent(id)}`,
    { revalidate: false }
  ));

export const resolvePublicAssetUrl = (value?: string | null) => {
  if (!value) return "/placeholder.svg";
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${getBackendOrigin()}${path}`;
};
