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
    handleClose,
  } = useGlobalRating();

  console.log("GlobalRatingModal render:", {
    showModal,
    selectedItem,
    rating,
    ratingLoading,
    errorMsg,
  });
  

  if (!showModal || !selectedItem) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
        <p className="text-sm text-primary font-bold mb-1">العطاء بيكمل بكلمة شكر 💚</p>

        <h3 className="text-lg font-bold mb-5 text-[#191c1d]">
          قيم تجربتك مع{" "}
          <span className="text-primary">
            {selectedItem.donor?.name || "المتبرع"}
          </span>
        </h3>

        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              aria-label={`${star} نجوم`}
              className={`transition-all hover:scale-125 ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: `'FILL' ${rating >= star ? 1 : 0}` }}
              >
                star
              </span>
            </button>
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-red-500 font-bold mb-3">{errorMsg}</p>
        )}

        {rating === 0 && (
          <p className="text-xs text-gray-400 mb-3">اختر عدد النجوم أولاً ⭐</p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleRate}
            disabled={ratingLoading || rating === 0}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 transition-opacity"
          >
            {ratingLoading ? "جاري الحفظ..." : "إرسال التقييم"}
          </button>

          <button
            onClick={handleClose}
            className="w-full text-sm text-gray-500 py-2"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}