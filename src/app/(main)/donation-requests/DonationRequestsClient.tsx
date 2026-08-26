import type { ReactNode } from "react";

interface RequestStateProps {
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  icon?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export default function RequestState({
  isLoading = false,
  error = null,
  isEmpty = false,
  icon = "inbox",
  title = "لا توجد بيانات حالياً",
  description,
  onRetry,
  retryLabel = "إعادة المحاولة",
  className = "",
}: RequestStateProps): ReactNode {
  if (!isLoading && !error && !isEmpty) return null;

  if (isLoading) {
    return (
      <div
        className={["flex min-h-64 flex-col items-center justify-center gap-3 text-center", className].filter(Boolean).join(" ")}
        role="status"
        aria-busy="true"
      >
        <span className="material-symbols-outlined animate-pulse text-4xl text-primary">sync</span>
        <p className="text-sm font-bold text-on-surface-soft">جارٍ التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={["surface-card flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center", className].filter(Boolean).join(" ")}
        role="alert"
        aria-live="assertive"
      >
        <span className="material-symbols-outlined rounded-2xl bg-danger-bg p-3 text-3xl text-danger">wifi_off</span>
        <div>
          <h2 className="text-base font-black text-on-surface">تعذر تحميل البيانات</h2>
          <p className="mt-1 max-w-md text-sm font-semibold leading-7 text-on-surface-soft">{error}</p>
        </div>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary">
            <span className="material-symbols-outlined text-base">refresh</span>
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={["surface-card flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center", className].filter(Boolean).join(" ")}
      role="status"
    >
      <span className="material-symbols-outlined rounded-2xl bg-surface-container-low p-3 text-3xl text-on-surface-soft">{icon}</span>
      <div>
        <h2 className="text-base font-black text-on-surface">{title}</h2>
        {description && <p className="mt-1 text-sm font-semibold text-on-surface-soft">{description}</p>}
      </div>
    </div>
  );
}
