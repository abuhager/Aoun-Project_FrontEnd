"use client";

import { useGlobalRating } from "./useGlobalRating";
import AccessibleDialog from "@/components/ui/AccessibleDialog";

export default function GlobalRatingModal() {
  const {
    showModal,
    selectedItem,
    rating,
    setRating,
    ratingLoading,
    errorMsg,
    handleRate,
  } = useGlobalRating();

  if (!showModal || !selectedItem) return null;

  const targetName = selectedItem.donor?.name || selectedItem.bookedBy?.name || "الطرف الآخر";

  return (
    <AccessibleDialog
      ariaLabel={`تقييم تجربتك مع ${targetName}`}
      dismissOnBackdrop={false}
      ariaBusy={ratingLoading}
      overlayClassName="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
      panelClassName="w-full max-w-sm select-none rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-2xl sm:p-8"
    >
        <p className="mb-1 text-sm font-bold text-primary">
          العطاء بيكمل بكلمة شكر 💚
        </p>

        <h3 className="mb-5 text-lg font-bold text-[#191c1d]">
          قيم تجربتك مع{" "}
          <span className="text-primary">
            {targetName}
          </span>
        </h3>

        <div className="mb-5 flex justify-center gap-1 sm:gap-2" role="radiogroup" aria-label="عدد النجوم">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} نجوم`}
              role="radio"
              aria-checked={rating === star}
              className={`touch-target rounded-xl transition-all hover:scale-110 ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              <span
                className="material-symbols-outlined text-4xl"
                style={{
                  fontVariationSettings: `'FILL' ${rating >= star ? 1 : 0}`,
                }}
              >
                star
              </span>
            </button>
          ))}
        </div>

        {errorMsg && (
          <p role="alert" className="mb-3 text-xs font-bold text-red-500">{errorMsg}</p>
        )}

        {rating === 0 && (
          <p className="mb-3 text-xs text-gray-400">اختر عدد النجوم أولاً ⭐</p>
        )}

        <button
          type="button"
          onClick={handleRate}
          disabled={ratingLoading || rating === 0}
          className="w-full rounded-2xl bg-primary py-4 font-bold text-white shadow-lg transition-opacity disabled:opacity-50 hover:bg-primary/90"
        >
          {ratingLoading ? "جاري الحفظ..." : "إرسال التقييم"}
        </button>
    </AccessibleDialog>
  );
}
