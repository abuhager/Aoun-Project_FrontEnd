"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// 1. تعريف الأنواع (Interfaces)
interface User {
  name: string;
  email: string;
  trustScore: number;
  quota: number;
  isVerifiedStudent?: boolean;
}

interface Item {
  _id: string;
  title: string;
  imageUrl: string;
  status: string;
  createdAt: string;
  isRated: boolean;
  otp?: string;
  bookedBy?: { _id: string; name: string; phone: string };
  donor?: { _id: string; name: string; phone: string };
}

interface DashboardData {
  myDonations: Item[];
  myRequests: Item[];
  user: User | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    myDonations: [],
    myRequests: [],
    user: null,
  });
  const [activeTab, setActiveTab] = useState<"donations" | "requests">("donations");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // متغيرات الـ OTP فقط (لأن التقييم نقلناه)
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const backendBaseUrl = "https://aoun-project-backend.onrender.com";

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await axios.get(`${backendBaseUrl}/api/items/me`, {
        headers: { "x-auth-token": token },
      });
      setData(res.data);
    } catch (err) {
      console.error("خطأ في تحميل البيانات", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReport = async (userId: string, itemTitle: string) => {
    const reason = prompt(`لماذا تود التبليغ عن هذا المستخدم بخصوص "${itemTitle}"؟`);
    if (!reason) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendBaseUrl}/api/items/report-user`,
        { reportedUserId: userId, reason },
        { headers: { "x-auth-token": token } },
      );
      alert(res.data.msg);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.msg || "حدث خطأ أثناء تقديم البلاغ ❌");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التبرع؟")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendBaseUrl}/api/items/delete/${id}`, {
        headers: { "x-auth-token": token },
      });
      fetchData();
    } catch {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleConfirmDelivery = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setOtpError(err.response?.data?.msg || "الرمز غير صحيح ❌");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="bg-surface min-h-screen pb-16 md:pb-20 text-[#191c1d] font-body" dir="rtl">
      <Navbar />
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Profile Card */}
        <section className="bg-white rounded-2xl p-6 md:p-8 text-center flex flex-col items-center gap-3 shadow-sm border border-[#edeeef] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-primary/10 z-10">
            <span className="material-symbols-outlined text-4xl md:text-5xl text-primary">
              account_circle
            </span>
          </div>
          <div className="z-10 flex flex-col items-center">
            <h1 className="text-xl md:text-2xl font-black flex items-center justify-center gap-2">
              {data.user?.name || "مستخدم عون"}
              {data.user?.isVerifiedStudent && (
                <span className="material-symbols-outlined text-secondary text-xl" title="طالب جامعي">school</span>
              )}
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant mt-1">
              {data.user?.email}
            </p>
            {(data.user?.trustScore ?? 0) >= 90 && (
              <span className="mt-2.5 flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-blue-100 shadow-sm">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                عضو موثوق
              </span>
            )}
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#edeeef] text-center flex flex-col items-center justify-center">
            <span className="text-on-surface-variant font-bold text-xs block mb-3">نقاط الثقة</span>
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-[#e7e8e9]" cx="40" cy="40" r="36" fill="transparent" strokeWidth="6"></circle>
                <circle
                  className="text-primary"
                  cx="40"
                  cy="40"
                  r="36"
                  fill="transparent"
                  strokeWidth="6"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * (data.user?.trustScore || 85)) / 100}
                ></circle>
              </svg>
              <span className="absolute text-xl font-black text-primary">{data.user?.trustScore || 85}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#edeeef] flex flex-col justify-center text-center gap-3">
            <span className="text-on-surface-variant font-bold text-xs">الكوتا المتبقية</span>
            <div className="h-2 w-full bg-[#e7e8e9] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${((data.user?.quota || 0) / 3) * 100}%` }}
              ></div>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-bold">
              {(data.user?.quota ?? 3) > 0
                ? `متاح لك حجز ${data.user?.quota ?? 3} أغراض إضافية هذا الشهر`
                : "لقد استنفدت حصتك لهذا الشهر ⚠️"}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#edeeef] flex flex-col items-center justify-center gap-2">
            <span className="text-on-surface-variant font-bold text-xs">إجمالي العطاء</span>
            <span className="text-4xl md:text-5xl font-black text-primary">{data.myDonations.length}</span>
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-xs">favorite</span>
              <span className="text-[10px] font-bold">أثرك ممتد</span>
            </div>
          </div>
        </section>

        {/* Tabs and Table */}
        <section className="space-y-4">
          <div className="flex border-b border-[#edeeef] gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("donations")}
              className={`px-4 py-3 font-bold text-sm transition-all ${activeTab === "donations" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"}`}
            >
              تبرعاتي
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-3 font-bold text-sm transition-all ${activeTab === "requests" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"}`}
            >
              طلباتي
            </button>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#edeeef]">
            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-162.5 text-xs md:text-sm">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-bold">
                    <th className="px-4 py-3">اسم الغرض</th>
                    <th className="px-4 py-3">الصورة</th>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3 text-center">الحالة</th>
                    <th className="px-4 py-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edeeef]">
                  {(activeTab === "donations" ? data.myDonations : data.myRequests).map((item) => (
                    <tr key={item._id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3 font-bold">{item.title}</td>
                      <td className="px-4 py-3">
                        <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                          <Image
                            alt={item.title}
                            src={
                              item.imageUrl
                                ? item.imageUrl.startsWith("http")
                                  ? item.imageUrl
                                  : `${backendBaseUrl}/${item.imageUrl}`
                                : "https://via.placeholder.com/100"
                            }
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === "تم التسليم" ? "bg-green-100 text-green-700" : item.status === "محجوز" ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"}`}
                          >
                            {item.status}
                          </span>

                          {(item.status === "محجوز" || item.status === "تم التسليم") && (
                            <Link
                              href={`/profile/${activeTab === "donations" ? item.bookedBy?._id : item.donor?._id}`}
                              className="text-[9px] text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[12px]">person</span>{" "}
                              {activeTab === "donations"
                                ? `المستلم: ${item.bookedBy?.name.split(" ")[0]}`
                                : `المتبرع: ${item.donor?.name.split(" ")[0]}`}
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/items/${item._id}`)}
                            className="text-primary hover:underline font-bold text-xs"
                          >
                            التفاصيل
                          </button>

                          {activeTab === "requests" && item.status === "محجوز" && item.otp && (
                            <div
                              className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 cursor-help"
                              title="أعطِ هذا الرمز للمتبرع عند الاستلام"
                            >
                              <span className="material-symbols-outlined text-blue-500 text-sm">lock</span>
                              <span className="text-blue-700 text-xs font-black tracking-widest">{item.otp}</span>
                            </div>
                          )}

                          {activeTab === "donations" && item.status === "متاح" && (
                            <button
                              onClick={() => router.push(`/edit-item/${item._id}`)}
                              className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg"
                              title="تعديل"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                          )}

                          {activeTab === "donations" && item.status === "متاح" && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          )}

                          {activeTab === "donations" && item.status === "محجوز" && (
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowModal(true);
                              }}
                              className="bg-primary text-white px-3 py-1 rounded-lg text-[10px] font-bold"
                            >
                              تأكيد التسليم
                            </button>
                          )}

                          {(item.status === "محجوز" || item.status === "تم التسليم") && (
                            <>
                              <a
                                href={`https://wa.me/${(activeTab === "requests" ? item.donor?.phone : item.bookedBy?.phone)?.replace(/\D/g, "")}`}
                                target="_blank"
                                className="bg-[#25D366] text-white p-1.5 rounded-lg"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.124.553 4.195 1.604 6.015L.234 23.4l5.495-1.44a11.96 11.96 0 0 0 6.302 1.763c6.648 0 12.031-5.383 12.031-12.031S18.679 0 12.031 0zm3.84 17.387c-.165.465-.96 1.05-1.503 1.155-.544.105-1.042.23-3.21-.67-2.613-1.085-4.282-3.765-4.412-3.938-.13-.173-1.054-1.405-1.054-2.68 0-1.275.66-1.905.897-2.16.237-.255.513-.319.682-.319.17 0 .341.005.49.012.16.007.375-.062.571.393.195.455.665 1.62.723 1.745.058.125.097.27.019.43-.078.16-.117.26-.237.41-.12.15-.25.32-.355.45-.115.14-.24.29-.105.504.135.215.6 1.005 1.3 1.635.905.815 1.69 1.07 1.91 1.19.22.12.35.095.48-.07.13-.165.56-.655.71-.88.15-.225.3-.187.5-.112.2.075 1.26.595 1.475.705.215.11.355.165.405.255.05.09.05.52-.115.985z" />
                                </svg>
                              </a>
                              <button
                                onClick={() => {
                                  const targetId = activeTab === "requests" ? item.donor?._id : item.bookedBy?._id;
                                  if (targetId) handleReport(targetId, item.title);
                                }}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg"
                              >
                                <span className="material-symbols-outlined text-sm">report</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* مودال OTP فقط */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-lg font-bold mb-2 text-primary">تأكيد التسليم</h3>
            <p className="text-on-surface-variant text-xs mb-5">
              أدخل رمز الـ OTP الخاص بـ <span className="font-bold">{selectedItem.title}</span>
            </p>
            {otpError && <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs mb-4">{otpError}</div>}
            <form onSubmit={handleConfirmDelivery}>
              <input
                type="text"
                maxLength={4}
                className="w-full bg-surface-container-highest text-center text-2xl font-black py-3 rounded-xl mb-5 outline-none"
                placeholder="••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 4}
                  className="flex-1 bg-primary text-white text-sm font-bold py-3 rounded-full"
                >
                  {otpLoading ? "جاري التأكيد..." : "تأكيد"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-surface-container-low text-on-surface-variant text-sm font-bold py-3 rounded-full"
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