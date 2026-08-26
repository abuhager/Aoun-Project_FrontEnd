"use client";

interface RequestStateProps {
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  icon?: string;
  title?: string;
  description?: string;
  referenceId?: string | null;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const joinClassNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export default function RequestState({
  isLoading = false,
  error = null,
  isEmpty = false,
  icon = "inbox",
  title = "لا توجد بيانات حالياً",
  description,
  referenceId,
  onRetry,
  retryLabel = "إعادة المحاولة",
  className = "",
}: RequestStateProps) {
  if (!isLoading && !error && !isEmpty) return null;

  if (isLoading) {
    return (
      <div
        className={joinClassNames(
          "flex min-h-64 flex-col items-center justify-center gap-3 text-center",
          className
        )}
        role="status"
        aria-busy="true"
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined animate-spin text-4xl text-primary"
        >
          progress_activity
        </span>
        <p className="text-sm font-bold text-[#6f6962]">جارٍ التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={joinClassNames(
          "surface-card flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center",
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined rounded-2xl bg-red-50 p-3 text-3xl text-red-600"
        >
          cloud_off
        </span>
        <div>
          <h2 className="text-base font-black text-[#1e2526]">
            تعذر تحميل البيانات
          </h2>
          <p className="mt-1 max-w-md text-sm font-semibold leading-7 text-[#6f6962]">
            {error}
          </p>
          {referenceId && (
            <p className="mt-2 text-[11px] font-bold text-[#9a938b]">
              رقم التتبع: <span dir="ltr">{referenceId}</span>
            </p>
          )}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">
              refresh
            </span>
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={joinClassNames(
        "surface-card flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center",
        className
      )}
      role="status"
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined rounded-2xl bg-[#f4f1eb] p-3 text-3xl text-[#9a938b]"
      >
        {icon}
      </span>
      <div>
        <h2 className="text-base font-black text-[#1e2526]">{title}</h2>
        {description && (
          <p className="mt-1 max-w-md text-sm font-semibold leading-7 text-[#6f6962]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
