"use client";

import { useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // 🟢 فحص أولي قبل إرسال الطلب للسيرفر
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين ❌");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل 🔒");
      setLoading(false);
      return;
    }

    try {
      // استدعاء API الباك إند المحدث
      const res = await axios.put(
        `https://aoun-project-backend.onrender.com/api/auth/reset-password/${token}`,
        { password }
      );

      // 🟢 تنظيف أمني: مسح أي بيانات قديمة لضمان دخول نظيف بالكلمة الجديدة
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Cookies.remove("token");

      setMessage(res.data.msg);
      setIsSuccess(true);

      // تحويل المستخدم بعد 3 ثواني
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "الرابط غير صالح أو انتهت صلاحيته.");
      } else {
        setError("حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-body" dir="rtl">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-sm border border-[#edeeef] text-center">
        
        {/* أيقونة الحالة العلوية */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl text-primary">
            {isSuccess ? "verified" : "lock_reset"}
          </span>
        </div>

        <h1 className="text-2xl font-black text-[#191c1d] mb-2 font-headline">
          {isSuccess ? "تم التغيير بنجاح!" : "تعيين كلمة مرور جديدة"}
        </h1>
        <p className="text-sm text-on-surface-variant mb-8">
          {isSuccess 
            ? "تم تحديث كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول."
            : "أدخل كلمة المرور الجديدة الخاصة بك أدناه لضمان أمان حسابك."}
        </p>

        {/* رسائل التنبيه */}
        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold mb-6 border border-green-100 animate-in fade-in slide-in-from-top-2">
            {message}
            <p className="text-[10px] mt-2 opacity-80">جاري تحويلك لصفحة تسجيل الدخول... ⏳</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        {!isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            
            {/* حقل كلمة المرور الجديدة */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 mr-2 block">كلمة المرور الجديدة</label>
              <div className="relative group">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors z-10">
                  lock
                </span>
                <input
                  type="password"
                  required
                  className="w-full pr-12 pl-4 py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-bold tracking-widest placeholder:tracking-normal placeholder:font-normal"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* حقل تأكيد كلمة المرور - مع توزيع الأيقونات لمنع التداخل */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 mr-2 block">تأكيد كلمة المرور</label>
              <div className="relative group">
                {/* القفل على اليمين */}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors z-10">
                  lock
                </span>

                {/* 🟢 علامة الصح على اليسار تظهر عند التطابق */}
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl text-green-500 z-10 animate-in fade-in zoom-in duration-300">
                    check_circle
                  </span>
                )}

                <input
                  type="password"
                  required
                  className="w-full pr-12 pl-12 py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-bold tracking-widest placeholder:tracking-normal placeholder:font-normal"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50 shadow-md mt-4 shadow-primary/20 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">published_with_changes</span>
                  حفظ وتغيير كلمة المرور
                </>
              )}
            </button>
          </form>
        )}

        {isSuccess && (
          <Link
            href="/login"
            className="inline-block mt-4 bg-surface-container-low text-on-surface-variant px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors shadow-sm"
          >
            العودة لتسجيل الدخول الآن
          </Link>
        )}
      </div>
    </div>
  );
}