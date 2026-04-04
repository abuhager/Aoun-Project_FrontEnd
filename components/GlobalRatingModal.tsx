"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";

interface Item {
  _id: string;
  title: string;
  status: string;
  isRated: boolean;
  donor?: { _id: string; name: string };
  bookedBy?: { _id: string; name: string };
}

export default function GlobalRatingModal() {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  const pathname = usePathname();
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://aoun-project-backend.onrender.com";
  const checkPendingRatings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // إذا مش مسجل دخول، ما تعمل إشي

    // لا تطلع المودال إذا اليوزر بصفحة تسجيل الدخول أو التسجيل
    if (pathname === "/login" || pathname === "/register") return;

    try {
      const res = await axios.get(`${backendBaseUrl}/api/items/me`, {
        headers: { "x-auth-token": token },
      });

      const requests: Item[] = res.data.myRequests;

      if (requests && requests.length > 0) {
        // دور على أول غرض مستلم ومش مقيم
        const pendingItem = requests.find(
          (item) => item.status === "تم التسليم" && !item.isRated,
        );

        if (pendingItem) {
          setSelectedItem(pendingItem);
          setShowRatingModal(true);
        } else {
          setShowRatingModal(false);
        }
      }
    } catch (err) {
      console.error("خطأ في فحص التقييمات المعلقة", err);
    }
  };

  // افحص التقييمات أول ما يفتح الموقع، وكل ما يتغير الرابط (ينتقل لصفحة ثانية)
  useEffect(() => {
    checkPendingRatings();
  }, [pathname]);

  const handleRateItem = async () => {
    if (rating === 0 || !selectedItem)
      return alert("الرجاء اختيار عدد النجوم ⭐");

    try {
      setRatingLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${backendBaseUrl}/api/items/rate/${selectedItem._id}`,
        { rating },
        { headers: { "x-auth-token": token } },
      );

      alert(res.data.msg);
      setShowRatingModal(false);
      setRating(0);
      setSelectedItem(null);

      // ارجع افحص كمان مرة، بركي عنده غرض ثاني مش مقيمه!
      checkPendingRatings();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.msg || "حدث خطأ أثناء التقييم ❌");
      }
    } finally {
      setRatingLoading(false);
    }
  };

  if (!showRatingModal || !selectedItem) return null; // لا ترندر إشي إذا ما في داعي

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
        <p className="text-sm text-primary font-bold mb-2">
          العطاء بيكمل بكلمة شكر 💚
        </p>

        <div className="flex justify-center gap-2 mb-6 mt-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`transition-all hover:scale-125 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
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
        <h3 className="text-lg font-bold mb-6 text-[#191c1d]">
          قيم تجربتك مع المتبرع{" "}
          <span className="text-primary">
            {selectedItem.donor?.name || "المتبرع"}
          </span>
        </h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRateItem}
            disabled={ratingLoading || rating === 0}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50"
          >
            {ratingLoading ? "جاري الحفظ..." : "إرسال التقييم"}
          </button>
        </div>
      </div>
    </div>
  );
}
