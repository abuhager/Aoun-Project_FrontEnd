export default function AppLoading() {
  return (
    <div
      className="flex min-h-[60dvh] items-center justify-center px-4 py-20"
      role="status"
      aria-live="polite"
      aria-label="جاري تحميل الصفحة"
    >
      <div className="surface-card w-full max-w-sm p-6 text-center" aria-busy="true">
        <span
          className="material-symbols-outlined animate-pulse text-4xl text-primary"
          aria-hidden="true"
        >
          volunteer_activism
        </span>
        <p className="mt-3 text-sm font-bold text-on-surface-variant">
          جاري تجهيز الصفحة...
        </p>
        <span className="sr-only">يرجى الانتظار</span>
      </div>
    </div>
  );
}
