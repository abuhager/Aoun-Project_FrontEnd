import type { PublicSettings } from "@/types/settings.types";

export const PUBLIC_SETTINGS_CACHE_KEY = "/api/settings/public";

type PublicSettingsOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

const resolveEndpoint = (): string => {
  if (typeof window !== "undefined") return PUBLIC_SETTINGS_CACHE_KEY;

  const serverBaseUrl = (
    process.env.BACKEND_URL
    ?? process.env.NEXT_PUBLIC_API_URL
    ?? ""
  ).replace(/\/$/, "");

  if (!serverBaseUrl) {
    throw new Error("PUBLIC_SETTINGS_API_URL_MISSING");
  }
  return `${serverBaseUrl}${PUBLIC_SETTINGS_CACHE_KEY}`;
};

export async function getPublicSettings(
  { signal, timeoutMs = 5_000 }: PublicSettingsOptions = {}
): Promise<PublicSettings> {
  const controller = new AbortController();
  const forwardAbort = () => controller.abort(signal?.reason);
  const timer = setTimeout(() => {
    controller.abort(new DOMException("Request timed out", "TimeoutError"));
  }, timeoutMs);

  if (signal?.aborted) forwardAbort();
  else signal?.addEventListener("abort", forwardAbort, { once: true });

  try {
    const response = await fetch(resolveEndpoint(), {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error("تعذّر تحميل إعدادات المنصة") as Error & {
        status: number;
      };
      error.status = response.status;
      throw error;
    }

    return response.json() as Promise<PublicSettings>;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }
}
