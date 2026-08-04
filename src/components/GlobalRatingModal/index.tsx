"use client";

import { useGlobalRating } from "./useGlobalRating";

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

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
      dir="rtl"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
        <p className="mb-1 text-sm font-bold text-primary">
          العطاء بيكمل بكلمة شكر 💚
        </p>

        <h3 className="mb-5 text-lg font-bold text-[#191c1d]">
          قيم تجربتك مع{" "}
          <span className="text-primary">
            {selectedItem.donor?.name || "المتبرع"}
          </span>
        </h3>

        <div className="mb-5 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} نجوم`}
              className={`transition-all hover:scale-125 ${
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
          <p className="mb-3 text-xs font-bold text-red-500">{errorMsg}</p>
        )}

        {rating === 0 && (
          <p className="mb-3 text-xs text-gray-400">اختر عدد النجوم أولاً ⭐</p>
        )}

        <button
          type="button"
          onClick={handleRate}
          disabled={ratingLoading || rating === 0}
          className="w-full rounded-2xl bg-primary py-4 font-bold text-white shadow-lg transition-opacity disabled:opacity-50"
        >
          {ratingLoading ? "جاري الحفظ..." : "إرسال التقييم"}
        </button>
      </div>
    </div>
  );
}