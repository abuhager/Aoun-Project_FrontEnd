import axios from "axios";
import type { ApiError } from "@/types/api.types";

export interface NormalizedApiError {
  message: string;
  code: string | null;
  status: number | null;
  requestId: string | null;
  field: string | null;
  isCanceled: boolean;
  isNetworkError: boolean;
}

const INTERNAL_ERROR_CODE = /^[A-Z][A-Z0-9_]+$/;

const safeLocalMessage = (error: Error, fallback: string): string =>
  INTERNAL_ERROR_CODE.test(error.message) ? fallback : error.message || fallback;

export function normalizeApiError(
  error: unknown,
  fallback = "حدث خطأ غير متوقع"
): NormalizedApiError {
  const isDomException =
    typeof DOMException !== "undefined" && error instanceof DOMException;
  const isCanceled =
    axios.isCancel(error)
    || (isDomException && error.name === "AbortError");

  if (isCanceled) {
    return {
      message: fallback,
      code: "REQUEST_CANCELED",
      status: null,
      requestId: null,
      field: null,
      isCanceled: true,
      isNetworkError: false,
    };
  }

  if (axios.isAxiosError<ApiError>(error)) {
    const payload = error.response?.data;
    return {
      message: payload?.msg ?? payload?.message ?? fallback,
      code: payload?.code ?? error.code ?? null,
      status: error.response?.status ?? null,
      requestId: payload?.requestId ?? null,
      field: payload?.field ?? null,
      isCanceled: error.code === "ERR_CANCELED",
      isNetworkError: !error.response,
    };
  }

  if (error instanceof Error) {
    const isTimeout = isDomException && error.name === "TimeoutError";
    const isFetchNetworkError =
      error instanceof TypeError
      && /fetch|network|load failed/i.test(error.message);
    const status = "status" in error && typeof error.status === "number"
      ? error.status
      : null;
    return {
      message: isTimeout ? fallback : safeLocalMessage(error, fallback),
      code: isTimeout ? "REQUEST_TIMEOUT" : null,
      status,
      requestId: null,
      field: null,
      isCanceled: false,
      isNetworkError: isTimeout || isFetchNetworkError,
    };
  }

  return {
    message: fallback,
    code: null,
    status: null,
    requestId: null,
    field: null,
    isCanceled: false,
    isNetworkError: false,
  };
}

export const extractErrorMsg = (error: unknown, fallback?: string): string =>
  normalizeApiError(error, fallback).message;

export const isRequestCanceled = (error: unknown): boolean =>
  normalizeApiError(error).isCanceled;

export const shouldRetryApiRequest = (error: unknown): boolean => {
  const normalized = normalizeApiError(error);
  if (normalized.isCanceled) return false;
  if (normalized.status !== null) return normalized.status >= 500;
  return normalized.isNetworkError;
};
