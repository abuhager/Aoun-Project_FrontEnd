// src/lib/api/extractErrorMsg.ts

export function extractErrorMsg(
  err: unknown,
  fallback = 'حدث خطأ غير متوقع'
): string {
  if (err && typeof err === 'object' && 'isAxiosError' in err) {
    const e = err as {
      response?: { data?: { msg?: string; message?: string }; status?: number };
    };
    return e.response?.data?.msg ?? e.response?.data?.message ?? fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
