"use client";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  mode?: "numbers" | "compact";
  disabled?: boolean;
  className?: string;
};

const NUMBER_BUTTON_CLASS =
  "h-10 min-w-10 rounded-2xl px-3 text-sm font-black transition-colors duration-300";

const COMPACT_BUTTON_CLASS =
  "rounded-2xl border border-[#e5dfd6] bg-white px-4 py-2 text-sm font-bold text-[#6d6760] transition-colors hover:bg-[#faf8f4] disabled:cursor-not-allowed disabled:opacity-40";

export default function PaginationControls({
  page,
  totalPages,
  onPageChange,
  mode = "numbers",
  disabled = false,
  className = "",
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const currentPage = Math.min(Math.max(1, page), totalPages);
  const changePage = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    if (!disabled && safePage !== currentPage) onPageChange(safePage);
  };

  if (mode === "compact") {
    return (
      <nav
        aria-label="التنقل بين الصفحات"
        className={`flex items-center justify-center gap-3 ${className}`.trim()}
      >
        <button
          type="button"
          onClick={() => changePage(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={COMPACT_BUTTON_CLASS}
        >
          السابق
        </button>

        <span className="text-sm font-bold text-[#6f6962]" aria-live="polite">
          صفحة {currentPage} من {totalPages}
        </span>

        <button
          type="button"
          onClick={() => changePage(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={COMPACT_BUTTON_CLASS}
        >
          التالي
        </button>
      </nav>
    );
  }

  return (
    <nav
      aria-label="التنقل بين الصفحات"
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`.trim()}
    >
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => changePage(pageNumber)}
            disabled={disabled}
            aria-label={`الانتقال إلى الصفحة ${pageNumber}`}
            aria-current={currentPage === pageNumber ? "page" : undefined}
            className={`${NUMBER_BUTTON_CLASS} ${
              currentPage === pageNumber
                ? "bg-primary text-white shadow-[0_10px_20px_rgba(1,105,111,0.18)]"
                : "border border-[#e5dfd6] bg-white text-[#746e67] hover:bg-[#faf8f4]"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {pageNumber}
          </button>
        )
      )}
    </nav>
  );
}
