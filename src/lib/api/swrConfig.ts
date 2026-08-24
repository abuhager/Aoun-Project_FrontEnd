import type { SWRConfiguration } from "swr";
import { shouldRetryApiRequest } from "@/lib/api/apiError";

export const API_SWR_CONFIG: SWRConfiguration = Object.freeze({
  dedupingInterval: 5_000,
  focusThrottleInterval: 30_000,
  errorRetryCount: 2,
  errorRetryInterval: 1_000,
  keepPreviousData: true,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: shouldRetryApiRequest,
});
