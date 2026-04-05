"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ─── الأنواع ───
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
  donor?:    { _id: string; name: string; phone: string };
}

interface DashboardData {
  myDonations: Item[];
  myRequests:  Item[];
  user:        User | null;
}

// ─── Modal التأكيد الموحد ───
function ActionModal({ message, onConfirm, onCancel, confirmText = "تأكيد", isDanger = false }: {
  message:     string;
  onConfirm:   () => void;
  onCancel:    () => void;
  confirmText?: string;
  isDanger?:   boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100">
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-orange-500">warning</span>
        </div>
        {/* ✅ إصلاح 2: whitespace-pre-line يعرض \n كسطر جديد */}
        <p className="text-sm font-bold text-[#191c1d] leading-relaxed text-center whitespace-pre-line">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className={`flex-1 ${isDanger ? "bg-red-500" : "bg-primary"} text-white py-3 rounded-2xl font-black text-xs hover:opacity-90 transition-all`}>{confirmText}</button>
          <button onClick={onCancel}  className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all">تراجع</button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast الإشعارات بدل alert() ───
function Toast({ msg, type, onClose }: { msg: string; type: "error" | "success"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-3 ${type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
      <span>{msg}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

// ─── مساعد localStorage آمن مع SSR ───
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

export default function DashboardPage() {
  const [data,    setData]    = useState<DashboardData>({ myDonations: [], myRequests: [], user: null });
  // ✅ إصلاح 1: Typo "requests Jur" → "requests"
  const [activeTab, setActiveTab] = useState<"donations" | "requests">("donations");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // حالات الـ Modals
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; msg: string; isDanger: boolean; onConfirm: () => void }>({
    show: false, msg: "", isDanger: false, onConfirm: () => {}
  });
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [otp,          setOtp]          = useState("");
  const [otpError,     setOtpError]     = useState("");
  const [otpLoading,   setOtpLoading]   = useState(false);

  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = useCallback(async () => {
    try {
      // ✅ إصلاح 3: getToken() يتحقق من window
      const token = getToken();
      if (!token) return router.push("/login");
      const res = await axios.get(`${backendBaseUrl}/api/items/me`, { headers: { "x-auth-token": token } });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching dashboard", err);
    } finally {
      setLoading(false);
    }
  }, [router, backendBaseUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── 1. حذف الغرض ───
  const handleDelete = (id: string, status: string) => {
    // ✅ إصلاح 2: \n بدل \\n
    const msg = status === "محجوز"
      ? "⚠️ تنبيه: هذا الغرض محجوز حالياً!\nحذفك له سيعتبر كسر التزام وسيتم خصم 3 نقاط من رصيدك.\nهل أنت متأكد؟"
      : "هل أنت متأكد من حذف هذا التبرع نهائياً؟";

    setConfirmModal({
      show: true, msg, isDanger: status === "محجوز",
      onConfirm: async () => {
        try {
          const token = getToken();
          if (!token) return;
          await axios.delete(`${backendBaseUrl}/api/items/delete/${id}`, { headers: { "x-auth-token": token } });
          setConfirmModal(prev => ({ ...prev, show: false }));
          setToast({ msg: "تم حذف الغرض بنجاح ✅", type: "success" });
          fetchData();
        } catch {
          setConfirmModal(prev => ({ ...prev, show: false }));
          // ✅ إصلاح 4: Toast بدل alert()
          setToast({ msg: "خطأ في الحذف، حاول مرة أخرى", type: "error" });
        }
      }
    });
  };

  // ─── 2. إلغاء حجز المستلم ───
  const handleCancelBooking = (id: string) => {
    setConfirmModal({
      show: true,
      // ✅ إصلاح 2: \n بدل \\n
      msg: "هل تريد إلغاء حجز المستلم الحالي؟\n\nسيتم تمرير الدور تلقائياً للشخص التالي في الانتظار، وسيتم منع هذا المستلم من حجز الغرض مجدداً.",
      isDanger: true,
      onConfirm: async () => {
        try {
          const token = getToken();
          if (!token) return;
          await axios.put(`${backendBaseUrl}/api/items/cancel/${id}`, {}, { headers: { "x-auth-token": token } });
          setConfirmModal(prev => ({ ...prev, show: false }));
          setToast({ msg: "تم إلغاء الحجز بنجاح 🔄", type: "success" });
          fetchData();
        } catch {
          setConfirmModal(prev => ({ ...prev, show: false }));
          setToast({ msg: "خطأ في العملية، حاول مرة أخرى", type: "error" });
        }
      }
    });
  };

  // ─── 3. تأكيد التسليم بالـ OTP ───
  const handleConfirmDelivery = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setOtpError(""); setOtpLoading(true);
    try {
      const token = getToken();
      await axios.put(
        `${backendBaseUrl}/api/items/complete/${selectedItem._id}`,
        { otp },
        { headers: { "x-auth-token": token } }
      );
      setShowOtpModal(false);
      setOtp("");
      setToast({ msg: "تم تأكيد التسليم بنجاح! 💚", type: "success" });
      fetchData();
    } catch (err: any) {
      setOtpError(err.response?.data?.msg || "الرمز غير صحيح ❌");
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const activeItems = activeTab === "donations" ? data.myDonations : data.myRequests;

  return (
    <div className="bg-surface min-h-screen pb-16 text-[#191c1d] font-body" dir="rtl">
      <Navbar />

      {/* Modals */}
      {confirmModal.show && (
        <ActionModal
          message={confirmModal.msg}
          isDanger={confirmModal.isDanger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* ✅ إصلاح 4: Toast بدل alert() */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6">

        {/* Profile Card */}
        <section className="bg-white rounded-3xl p-8 text-center border border-[#edeeef] shadow-sm">
          <div className="w-24 h-24 rounded-full bg-slate-50 mx-auto flex items-center justify-center ring-4 ring-primary/5 mb-4">
            <span className="material-symbols-outlined text-5xl text-primary">account_circle</span>
          </div>
          <h1 className="text-2xl font-black">{data.user?.name}</h1>
          <p className="text-xs text-on-surface-variant">{data.user?.email}</p>
          {(data.user?.trustScore ?? 0) >= 90 && (
            <div className="mt-3 inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black border border-blue-100">
              <span className="material-symbols-outlined text-sm">verified</span> عضو موثوق
            </div>
          )}
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#edeeef] text-center">
            <p className="text-xs font-bold text-gray-400 mb-4">مؤشر الثقة</p>
            <p className="text-3xl font-black text-primary">{data.user?.trustScore}%</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#edeeef] text-center flex flex-col justify-center">
            <p className="text-xs font-bold text-gray-400 mb-2">الكوتا المتاحة</p>
            <p className="text-3xl font-black text-blue-600">{data.user?.quota} / 2</p>
            <p className="text-[10px] text-blue-400 mt-1">حجوزات نشطة حالياً</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#edeeef] text-center flex flex-col justify-center">
            <p className="text-xs font-bold text-gray-400 mb-2">تبرعاتك</p>
            <p className="text-3xl font-black text-primary">{data.myDonations.length}</p>
            <p className="text-[10px] text-secondary mt-1 font-bold">بصمتك في الخير 💚</p>
          </div>
        </section>

        {/* Tabs & Table */}
        <section className="space-y-4">
          <div className="flex gap-4 border-b border-gray-100">
            {(["donations", "requests"] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                // ✅ إصلاح 5: border-b-2 بدل border-b-3
                className={`pb-3 text-sm font-black transition-all ${activeTab === t ? "text-primary border-b-2 border-primary" : "text-gray-400"}`}>
                {t === "donations" ? `تبرعاتي (${data.myDonations.length})` : `طلباتي (${data.myRequests.length})`}
              </button>
            ))}
          </div>

          {activeItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#edeeef] p-16 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-200 mb-4 block">inbox</span>
              <p className="text-sm font-bold text-gray-400">
                {activeTab === "donations" ? "لم تضف أي تبرعات بعد" : "لم تطلب أي أغراض بعد"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#edeeef] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold text-xs">
                      <th className="p-4">الغرض</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-gray-100 shrink-0">
                              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                            </div>
                            <span className="font-bold line-clamp-1">{item.title}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap ${
                            item.status === "محجوز"      ? "bg-blue-50 text-blue-600"     :
                            item.status === "تم التسليم" ? "bg-emerald-50 text-emerald-600" :
                            "bg-gray-50 text-gray-500"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <Link href={`/items/${item._id}`} className="text-primary hover:bg-primary/5 p-2 rounded-xl" title="عرض">
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </Link>

                            {/* ─── أزرار تبرعاتي ─── */}
                            {activeTab === "donations" && item.status !== "تم التسليم" && (
                              <>
                                {item.status === "محجوز" && (
                                  <button
                                    onClick={() => { setSelectedItem(item); setShowOtpModal(true); }}
                                    className="bg-primary text-white px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-primary/90 transition-all">
                                    تأكيد التسليم
                                  </button>
                                )}
                                {item.status === "محجوز" && (
                                  <button onClick={() => handleCancelBooking(item._id)}
                                    className="text-orange-500 hover:bg-orange-50 p-2 rounded-xl transition-all" title="إلغاء حجز المستلم">
                                    <span className="material-symbols-outlined text-lg">person_remove</span>
                                  </button>
                                )}
                                <button onClick={() => handleDelete(item._id, item.status)}
                                  className="text-red-400 hover:bg-red-50 p-2 rounded-xl transition-all" title="حذف">
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </>
                            )}

                            {/* ─── أزرار طلباتي ─── */}
                            {activeTab === "requests" && (
                              <>
                                {/* OTP للمحجوز */}
                                {item.status === "محجوز" && item.otp && (
                                  <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-mono font-black text-xs tracking-widest border border-blue-100">
                                    {item.otp} 🔐
                                  </div>
                                )}
                                {/* ✅ إصلاح 6: زر التقييم للمسلَّم وغير المقيَّم */}
                                {item.status === "تم التسليم" && !item.isRated && (
                                  <Link href={`/items/${item._id}`}
                                    className="bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-yellow-100 hover:bg-yellow-100 transition-all">
                                    قيّم ⭐
                                  </Link>
                                )}
                                {/* تم التقييم */}
                                {item.status === "تم التسليم" && item.isRated && (
                                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-emerald-100">
                                    تم التقييم ✅
                                  </span>
                                )}
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
          )}
        </section>
      </main>

      {/* Modal الـ OTP */}
      {showOtpModal && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleConfirmDelivery} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-4" dir="rtl">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-primary text-3xl">lock_open</span>
            </div>
            <h3 className="text-xl font-black text-primary">تأكيد الاستلام 🎁</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              أدخل الرمز الذي سيقدمه لك المستلم<br />
              <span className="font-black text-[#191c1d]">{selectedItem.title}</span>
            </p>
            {otpError && <p className="text-[10px] text-red-500 font-bold">{otpError}</p>}
            <input
              type="text" inputMode="numeric" maxLength={4}
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-gray-50 text-center text-3xl font-black py-4 rounded-2xl outline-none focus:ring-2 ring-primary/20 tracking-widest font-mono"
              placeholder="0000"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={otpLoading || otp.length !== 4}
                className="flex-1 bg-primary text-white py-3 rounded-2xl font-black text-xs disabled:opacity-50 transition-all">
                {otpLoading ? "جاري..." : "تأكيد التسليم"}
              </button>
              <button type="button" onClick={() => { setShowOtpModal(false); setOtp(""); setOtpError(""); }}
                className="flex-1 bg-gray-50 text-gray-400 py-3 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}