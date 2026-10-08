export function getBookingDeadlineState(expiresAt: string | null | undefined, now: number) {
  if (!expiresAt) return null;
  const deadline = Date.parse(expiresAt);
  if (!Number.isFinite(deadline)) return null;
  return now >= deadline ? "expired" : "active";
}
