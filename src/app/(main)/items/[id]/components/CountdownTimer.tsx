"use client";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  bookedAt:    string;
  isBooker:    boolean;
  isDonor:     boolean;
  // ✅ [FIX-6] expiryHours ديناميكي من Admin Settings — لا hardcoded 72
  expiryHours: number;
}

export function CountdownTimer({ bookedAt, isBooker, isDonor, expiryHours }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calc = () => {
      const deadline = new Date(bookedAt).getTime() + expiryHours * 60 * 60 * 1000;
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setTimeLeft("انتهى الوقت ⛔");
        setIsUrgent(false);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      // حد الإلحاح = 10% من المهلة الكاملة
      setIsUrgent(h < Math.ceil(expiryHours * 0.1));
      setTimeLeft(`${h}س ${String(m).padStart(2, "0")}د ${String(s).padStart(2, "0")}ث`);
    };

    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [bookedAt, expiryHours]);

  const title = isBooker
    ? isUrgent ? "⚠️ وقتك ينفد!" : "⏱️ مهلة استلامك للغرض"
    : isDonor
    ? "⏱️ مهلة استلام الحاجز"
    : "⏱️ وقت انتهاء الحجز الحالي";

  const subtitle = isBooker
    ? "سيُلغى حجزك تلقائياً عند انتهاء المهلة، أسرع بالاستلام!"
    : isDonor
    ? "إذا لم يستلم الحاجز، سيعود الغرض متاحاً أو ينتقل للمنتظر التالي."
    : "قد يعود الغرض متاحاً إذا لم يقم الحاجز الحالي باستلامه.";

  const isDangerState = isUrgent && isBooker;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
        isDangerState
          ? "bg-red-50 border-red-200 animate-pulse"
          : "bg-amber-50 border-amber-100"
      }`}
    >
      <span className={`material-symbols-outlined text-xl mt-0.5 ${isDangerState ? "text-red-500" : "text-amber-600"}`}>
        timer
      </span>
      <div className="space-y-1 flex-1">
        <p className={`text-xs font-black ${isDangerState ? "text-red-900" : "text-amber-900"}`}>{title}</p>
        <p className={`text-2xl font-black font-mono tracking-widest ${isDangerState ? "text-red-600" : "text-amber-700"}`}>
          {timeLeft}
        </p>
        <p className={`text-[10px] font-bold ${isDangerState ? "text-red-400" : "text-amber-500"}`}>{subtitle}</p>
      </div>
    </div>
  );
}
