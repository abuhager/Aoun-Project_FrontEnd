"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [data, setData] = useState({ myDonations: [], myRequests: [] });
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("donations");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ستيت نافذة تأكيد الـ OTP
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const backendBaseUrl = "http://localhost:5000";

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await axios.get(`${backendBaseUrl}/api/items/me`, {
        headers: { "x-auth-token": token },
      });
      setData(res.data);
    } catch (err) {
      console.error("خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // 🟢 لوجيك حذف التبرع
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذا التبرع؟ لا يمكن التراجع عن هذا الإجراء.",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendBaseUrl}/api/items/delete/${id}`, {
        headers: { "x-auth-token": token },
      });
      fetchData(); // تحديث الجدول بعد الحذف
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // لوجيك تأكيد التسليم
  const handleConfirmDelivery = async (e: any) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${backendBaseUrl}/api/items/complete/${selectedItem._id}`,
        { otp },
        { headers: { "x-auth-token": token } },
      );

      setShowModal(false);
      setOtp("");
      fetchData();
    } catch (err: any) {
      setOtpError(err.response?.data?.msg || "الرمز غير صحيح ❌");
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8f9fa]">
        <div className="w-10 h-10 border-4 border-[#006155] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div
      className="bg-[#f8f9fa] min-h-screen pb-16 md:pb-20 text-[#191c1d] font-body"
      dir="rtl"
    >
      <Navbar />

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Profile Card */}
        <section className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 text-center flex flex-col items-center gap-3 md:gap-4 shadow-sm border border-[#edeeef] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#006155]/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-[#006155]/10 z-10">
            <span className="material-symbols-outlined text-4xl md:text-5xl text-[#006155]">
              account_circle
            </span>
          </div>
          <div className="z-10">
            <h1 className="text-xl md:text-2xl font-black">
              {data.user?.name || "مستخدم عون"}
            </h1>
            <p className="text-xs md:text-sm text-[#40493d] mt-1">
              {data.user?.email}
            </p>
          </div>
          {/* 🟢 شارة التوثيق الذكية */}
          {data.user?.email?.includes('.edu') ? (
            <div className="flex items-center gap-1.5 bg-[#006e1c]/10 px-3 py-1 rounded-full border border-[#006e1c]/20 z-10">
              <span className="material-symbols-outlined text-[#006e1c] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              <span className="text-[#006e1c] font-bold text-[10px] md:text-xs">طالب موثق</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 z-10">
              <span className="material-symbols-outlined text-[#40493d] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              <span className="text-[#40493d] font-bold text-[10px] md:text-xs">مستخدم عادي</span>
            </div>
          )}
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-[#edeeef] text-center">
            <span className="text-[#40493d] font-bold text-xs md:text-sm block mb-3">
              نقاط الثقة
            </span>
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-[#e7e8e9]"
                  cx="40"
                  cy="40"
                  r="36"
                  fill="transparent"
                  strokeWidth="6"
                ></circle>
                <circle
                  className="text-[#006155]"
                  cx="40"
                  cy="40"
                  r="36"
                  fill="transparent"
                  strokeWidth="6"
                  strokeDasharray="226"
                  strokeDashoffset={
                    226 - (226 * (data.user?.trustScore || 85)) / 100
                  }
                ></circle>
              </svg>
              <span className="absolute text-xl font-black">
                {data.user?.trustScore || 85}
              </span>
            </div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-[#edeeef] flex flex-col justify-center text-center gap-3">
            <span className="text-[#40493d] font-bold text-xs md:text-sm">
              الكوتا المتبقية
            </span>
            <div className="h-1.5 md:h-2 w-full bg-[#e7e8e9] rounded-full overflow-hidden">
              <div className="h-full bg-[#005a8c] w-3/5 rounded-full"></div>
            </div>
            <div className="bg-[#cee5ff] text-[#004a75] px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold">
              ضايل لك 3 طلبات هذا الأسبوع
            </div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-[#edeeef] flex flex-col items-center justify-center gap-2">
            <span className="text-[#40493d] font-bold text-xs md:text-sm">
              إجمالي العطاء
            </span>
            <span className="text-4xl md:text-5xl font-black text-[#006155]">
              {data.myDonations.length}
            </span>
            <div className="flex items-center gap-1 text-[#006e1c]">
              <span
                className="material-symbols-outlined text-xs"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span className="text-[10px] md:text-xs font-bold">
                أثرك ممتد
              </span>
            </div>
          </div>
        </section>

        {/* Table Section */}
        <section className="space-y-4 md:space-y-6">
          <div className="flex border-b border-[#edeeef] gap-4 md:gap-6 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab("donations")}
              className={`px-4 py-3 font-bold text-sm md:text-base whitespace-nowrap transition-all ${activeTab === "donations" ? "text-[#006155] border-b-2 border-[#006155]" : "text-[#40493d] hover:text-[#006155]"}`}
            >
              تبرعاتي
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-3 font-bold text-sm md:text-base whitespace-nowrap transition-all ${activeTab === "requests" ? "text-[#006155] border-b-2 border-[#006155]" : "text-[#40493d] hover:text-[#006155]"}`}
            >
              طلباتي
            </button>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-[#edeeef]">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[650px] text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#f3f4f5] text-[#40493d] font-bold">
                    <th className="px-4 py-3">اسم الغرض</th>
                    <th className="px-4 py-3">الصورة</th>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3 text-center">الحالة</th>
                    <th className="px-4 py-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edeeef]">
                  {(activeTab === "donations"
                    ? data.myDonations
                    : data.myRequests
                  ).map((item: any) => (
                    <tr
                      key={item._id}
                      className="hover:bg-[#f8f9fa] transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-[#191c1d]">
                        {item.title}
                      </td>
                      <td className="px-4 py-3">
                        <img
                          alt={item.title}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover border border-gray-100"
                          src={
                            item.imageUrl
                              ? item.imageUrl.startsWith("http")
                                ? item.imageUrl
                                : `${backendBaseUrl}/${item.imageUrl}`
                              : "https://via.placeholder.com/100"
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-[#40493d]">
                        {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold ${item.status === "تم التسليم" ? "bg-[#006e1c]/10 text-[#006e1c]" : item.status === "محجوز" ? "bg-[#005a8c]/10 text-[#005a8c]" : "bg-[#006155]/10 text-[#006155]"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {/* 1️⃣ زر التفاصيل (دائماً بيظهر) */}
                          <button
                            onClick={() => router.push(`/items/${item._id}`)}
                            className="text-[#006155] hover:underline font-bold text-xs md:text-sm"
                          >
                            التفاصيل
                          </button>

                          {/* 2️⃣ زر التعديل والحذف (يظهر فقط في تبرعاتي إذا كان الغرض متاح) */}
                          {activeTab === "donations" &&
                            item.status === "متاح" && (
                              <>
                                {/* 🟢 زر التعديل */}
                                <button
                                  onClick={() => router.push(`/edit-item/${item._id}`)}
                                  className="text-[#005a8c] hover:bg-[#cee5ff] p-1.5 rounded-lg transition-colors"
                                  title="تعديل التبرع"
                                >
                                  <span className="material-symbols-outlined text-sm md:text-base">
                                    edit
                                  </span>
                                </button>

                                {/* 🟢 زر الحذف */}
                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="حذف التبرع"
                                >
                                  <span className="material-symbols-outlined text-sm md:text-base">
                                    delete
                                  </span>
                                </button>
                              </>
                            )}

                          {/* 3️⃣ عرض الـ OTP (يظهر في طلباتي) */}
                          {activeTab === "requests" && item.deliveryOtp && (
                            <div
                              className="text-[#005a8c] font-black tracking-widest bg-[#cee5ff] px-2 py-1 rounded text-center inline-block text-xs md:text-sm"
                              title="رمز الاستلام"
                            >
                              {item.deliveryOtp}
                            </div>
                          )}

                          {/* 4️⃣ زر تأكيد التسليم (يظهر في تبرعاتي) */}
                          {activeTab === "donations" &&
                            item.status === "محجوز" && (
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowModal(true);
                                }}
                                className="text-white bg-[#006155] px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold hover:bg-[#087c6e] shadow-sm transition-all active:scale-95"
                              >
                                تأكيد التسليم
                              </button>
                            )}

                          {/* 5️⃣ زر الواتساب (يظهر للطرفين إذا الغرض محجوز) */}
                          {item.status === "محجوز" && (
                            <a
                              href={`https://wa.me/${activeTab === "requests" ? item.donor?.phone : item.bookedBy?.phone}?text=${encodeURIComponent(activeTab === "requests" ? `مرحباً، أنا الطالب الذي قام بحجز "${item.title}" من منصة عون. متى يمكننا اللقاء للاستلام؟` : `مرحباً، بخصوص الغرض "${item.title}" الذي حجزته من منصة عون. أنا المتبرع، يرجى التنسيق للاستلام.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center bg-[#25D366] text-white p-1.5 rounded-lg hover:bg-[#1ebd5a] transition-colors shadow-sm active:scale-95"
                              title="تواصل عبر واتساب"
                            >
                              <svg
                                className="w-4 h-4 md:w-5 md:h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.124.553 4.195 1.604 6.015L.234 23.4l5.495-1.44a11.96 11.96 0 0 0 6.302 1.763c6.648 0 12.031-5.383 12.031-12.031S18.679 0 12.031 0zm3.84 17.387c-.165.465-.96 1.05-1.503 1.155-.544.105-1.042.23-3.21-.67-2.613-1.085-4.282-3.765-4.412-3.938-.13-.173-1.054-1.405-1.054-2.68 0-1.275.66-1.905.897-2.16.237-.255.513-.319.682-.319.17 0 .341.005.49.012.16.007.375-.062.571.393.195.455.665 1.62.723 1.745.058.125.097.27.019.43-.078.16-.117.26-.237.41-.12.15-.25.32-.355.45-.115.14-.24.29-.105.504.135.215.6 1.005 1.3 1.635.905.815 1.69 1.07 1.91 1.19.22.12.35.095.48-.07.13-.165.56-.655.71-.88.15-.225.3-.187.5-.112.2.075 1.26.595 1.475.705.215.11.355.165.405.255.05.09.05.52-.115.985z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(activeTab === "donations" ? data.myDonations : data.myRequests)
                .length === 0 && (
                <div className="p-12 text-center text-[#40493d]">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-20">
                    inventory_2
                  </span>
                  <p className="font-bold text-sm">لا يوجد بيانات لعرضها</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* نافذة الـ Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg md:text-xl font-bold text-center mb-2">
              تأكيد التسليم
            </h3>
            <p className="text-[#40493d] text-xs md:text-sm text-center mb-5">
              أدخل الرمز المكون من 4 أرقام لتأكيد تسليم "
              <span className="font-bold">{selectedItem.title}</span>".
            </p>
            {otpError && (
              <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs text-center font-bold mb-4">
                {otpError}
              </div>
            )}
            <form onSubmit={handleConfirmDelivery}>
              <input
                type="text"
                maxLength={4}
                className="w-full bg-[#f3f4f5] text-center text-xl md:text-2xl tracking-widest font-black py-3 md:py-4 rounded-xl mb-5 outline-none focus:ring-2 focus:ring-[#006155]/20"
                placeholder="••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                dir="ltr"
                required
              />
              <div className="flex gap-2 md:gap-3">
                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 4}
                  className="flex-1 bg-[#006155] text-white text-sm font-bold py-2.5 md:py-3 rounded-full hover:bg-[#087c6e] disabled:opacity-50 transition-all"
                >
                  {otpLoading ? "جاري التأكيد..." : "تأكيد"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setOtp("");
                    setOtpError("");
                  }}
                  className="flex-1 bg-[#f3f4f5] text-[#40493d] text-sm font-bold py-2.5 md:py-3 rounded-full hover:bg-[#e1e3e4] transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}