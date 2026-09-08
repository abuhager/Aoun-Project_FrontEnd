const AUTH_REFRESH_LOCK = "aoun-auth-refresh";

type LockManagerLike = {
  request<T>(
    name: string,
    options: { mode: "exclusive" },
    callback: () => Promise<T>
  ): Promise<T>;
};

export const withCrossTabRefreshLock = async <T>(
  callback: () => Promise<T>
): Promise<T> => {
  const locks = typeof navigator !== "undefined"
    ? (navigator as Navigator & { locks?: LockManagerLike }).locks
    : undefined;
  if (!locks) return callback();
  return locks.request(AUTH_REFRESH_LOCK, { mode: "exclusive" }, callback);
};

export default withCrossTabRefreshLock;
