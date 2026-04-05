"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";

// ─── الأنواع ───
interface Donor {
  _id: string;
  name: string;
  avatar?: string;
  trustScore: number;
}
interface WaitlistEntry {
  user: { _id: string } | string;
}
interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition?: string;
  status: string;
  imageUrl: string;
  location: string;
  createdAt: string;
  bookedAt?: string;
  donor: Donor;
  bookedBy?: { _id: string } | string;
  waitlist: WaitlistEntry[];
  deliveryOtp?: string;
  cancelledBy?: (string | { _id: string })[];
}

const getId = (field: any): string | null => {
  if (!field) return null;
  if (typeof field === "string") return field;
  if (typeof field === "object" && field._id) return String(field._id);
  return null;
};

// ─── Modal التأكيد مع ألوان ديناميكية ───
function ConfirmModal({ message, onConfirm, onCancel, isDanger = false }: { message: string; onConfirm: () => void; onCancel: () => void; isDanger?: boolean; }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl space-y-4 border border-gray-100">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${isDanger ? 'bg-red-50' : 'bg-orange-50'}`}>
          <span className={`material-symbols-outlined ${isDanger ? 'text-red-500' : 'text-orange-500'}`}>
            {isDanger ? 'warning' : 'help_outline'}
          </span>
        </div>
        <p className="text-sm font-bold text-[#191c1d] leading-relaxed text-center whitespace-pre-line">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className={`flex-1 text-white py-3 rounded-2xl font-black text-sm transition-all ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}>تأكيد</button>
          <button onClick={onCancel}  className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

// ─── Countdown Timer الذكي ───
function CountdownTimer({ bookedAt, isBooker, isDonor }: { bookedAt: string, isBooker: boolean, isDonor: boolean }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calc = () => {
      const deadline = new Date(bookedAt).getTime() + 72 * 60 * 60 * 1000;
      const diff = deadline - Date.now();
      if (diff <= 0) { setTimeLeft("انتهى الوقت ⛔"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setIsUrgent(h < 6);
      setTimeLeft(`${h}س ${String(m).padStart(2, "0")}د ${String(s).padStart(2, "0")}ث`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [bookedAt]);

  // تحديد النصوص والألوان حسب المستخدم
  const title = isBooker ? (isUrgent ? "⚠️ وقتك ينفد!" : "⏱️ مهلة استلامك للغرض")
              : isDonor ? "⏱️ مهلة استلام الحاجز"
              : "⏱️ وقت انتهاء الحجز الحالي";

  const subtitle = isBooker ? "سيُلغى حجزك تلقائياً عند انتهاء المهلة، أسرع بالاستلام!"
                 : isDonor ? "إذا لم يستلم الحاجز، سيعود الغرض متاحاً أو ينتقل للمنتظر التالي."
                 : "قد يعود الغرض متاحاً إذا لم يقم الحاجز الحالي باستلامه.";

  const isDangerState = isUrgent && isBooker;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${isDangerState ? "bg-red-50 border-red-200 animate-pulse" : "bg-amber-50 border-amber-100"}`}>
      <span className={`material-symbols-outlined text-xl mt-0.5 ${isDangerState ? "text-red-500" : "text-amber-600"}`}>timer</span>
      <div className="space-y-1 flex-1">
        <p className={`text-xs font-black ${isDangerState ? "text-red-900" : "text-amber-900"}`}>{title}</p>
        <p className={`text-2xl font-black font-mono tracking-widest ${isDangerState ? "text-red-600" : "text-amber-700"}`}>{timeLeft}</p>
        <p className={`text-[10px] font-bold ${isDangerState ? "text-red-400" : "text-amber-500"}`}>{subtitle}</p>
      </div>
    </div>
  );
}

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, msg: "", isDanger: false, onConfirm: () => {} });

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchItem = useCallback(async (isMounted = true, withAuth = false) => {
    try {
      const headers: Record<string, string> = {};
      if (withAuth && typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers["x-auth-token"] = token;
      }
      const res = await axios.get(`${backendUrl}/api/items/${id}`, { headers });
      if (isMounted) setItem(res.data);
    } catch { console.error("Error fetching"); }
    finally { if (isMounted) setLoading(false); }
  }, [id, backendUrl]);

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserId(payload.user.id);
        } catch { }
      }
    }
    if (id) fetchItem(isMounted, true);
    return () => { isMounted = false; };
  }, [id, fetchItem]);

  const isDonor = getId(item?.donor) === currentUserId;
  const isBooker = getId(item?.bookedBy) === currentUserId;
  const isWaitlisted = item?.waitlist?.some((w) => getId(w.user) === currentUserId);
  const isCancelledBefore = item?.cancelledBy?.some((uid) => getId(uid) === currentUserId);

  const handleRequestItem = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push(`/login?redirect=/items/${id}`);
    try {
      setActionLoading(true);
      setMessage({ type: "", text: "" });
      const res = await axios.put(`${backendUrl}/api/items/book/${id}`, {}, { headers: { "x-auth-token": token } });
      setMessage({ type: "success", text: res.data.msg });
      fetchItem(true, true);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.msg || "حدث خطأ" });
    } finally { setActionLoading(false); }
  };

  const handleCancelAction = () => {
    const isDanger = isBooker || isDonor;
    const confirmMsg = isBooker ? "⚠️ تنبيه: إلغاء الحجز سيمنعك من حجز هذه القطعة مجدداً للأبد!\nهل أنت متأكد؟" : isDonor ? "هل تريد إلغاء حجز المستلم وتمرير الدور؟" : "هل تريد الانسحاب من قائمة الانتظار؟";
    setConfirmModal({ show: true, msg: confirmMsg, isDanger, onConfirm: async () => {
      setConfirmModal(prev => ({ ...prev, show: false }));
      const token = localStorage.getItem("token");
      try {
        setActionLoading(true);
        const res = await axios.put(`${backendUrl}/api/items/cancel/${id}`, {}, { headers: { "x-auth-token": token } });
        setMessage({ type: "success", text: res.data.msg });
        fetchItem(true, true);
      } catch (err: any) { setMessage({ type: "error", text: "حدث خطأ" }); }
      finally { setActionLoading(false); }
    }});
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-surface"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!item) return <div className="text-center py-20 font-bold">🛑 القطعة غير موجودة</div>;

  return (
    <div className="bg-surface min-h-screen text-[#191c1d] pb-20" dir="rtl">
      <Navbar />
      {confirmModal.show && <ConfirmModal message={confirmModal.msg} isDanger={confirmModal.isDanger} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(p => ({ ...p, show: false }))} />}

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-5xl mx-auto">
        <nav className="mb-6 flex items-center gap-2 text-on-surface-variant text-xs font-medium">
          <Link href="/browse" className="hover:text-primary transition-colors">تصفح التبرعات</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_left</span>
          <span className="font-black truncate">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="relative rounded-3xl overflow-hidden bg-white aspect-square border border-[#edeeef] shadow-sm">
            <Image src={item.imageUrl.startsWith("http") ? item.imageUrl : `${backendUrl}/${item.imageUrl}`} alt={item.title} fill priority className="object-cover" />
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold">{item.category}</span>
                <span className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-bold">{item.condition || "حالة جيدة"}</span>
                {item.waitlist?.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="material-symbols-outlined text-blue-500 text-sm">group</span>
                    <p className="text-[10px] font-black text-blue-700">{item.waitlist.length} ينتظرون</p>
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-black leading-tight">{item.title}</h1>
              <p className="text-sm text-on-surface-variant bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">{item.description}</p>
            </div>

            {/* ✅ التنبيه والعداد الذكي حسب نوع المستخدم */}
            {item.status === "محجوز" && (
              item.bookedAt ? <CountdownTimer bookedAt={item.bookedAt} isBooker={isBooker} isDonor={isDonor} /> : (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <span className="material-symbols-outlined text-amber-600 text-xl">timer</span>
                  <div>
                    <p className="text-xs font-black text-amber-900">
                      {isBooker ? "تنبيه بخصوص وقت استلامك ⏱️" : "حالة الحجز الحالية ⏱️"}
                    </p>
                    <p className="text-[11px] text-amber-700 font-medium mt-1 leading-relaxed">
                      {isBooker 
                        ? "يجب إتمام الاستلام خلال 72 ساعة كحد أقصى، وإلا سيُلغى حجزك تلقائياً."
                        : "هذا الغرض محجوز حالياً. في حال لم يقم الحاجز بالاستلام خلال 72 ساعة، سيعود الغرض متاحاً وتُتاح الفرصة لغيره."
                      }
                    </p>
                  </div>
                </div>
              )
            )}

            {/* OTP للحاجز */}
            {isBooker && item.status === "محجوز" && item.deliveryOtp && (
              <div className="bg-primary/10 border-2 border-dashed border-primary p-6 rounded-3xl text-center shadow-inner">
                <p className="text-primary text-xs font-bold mb-2">رمز الاستلام الخاص بك 🔐</p>
                <div className="text-5xl font-black tracking-widest text-primary font-mono">{item.deliveryOtp}</div>
                <p className="text-[10px] text-primary/60 mt-3 font-bold">أظهر هذا الرمز للمتبرع لتأكيد الاستلام</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "الموقع", val: item.location, ic: "distance" },
                { label: "التاريخ", val: new Date(item.createdAt).toLocaleDateString("ar-EG"), ic: "event" },
                { label: "الموثوقية", val: (item.donor?.trustScore || 0) + "%", ic: "verified_user" },
              ].map((s, i) => (
                <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100 text-center">
                  <span className="material-symbols-outlined text-primary text-xl mb-1">{s.ic}</span>
                  <p className="text-[9px] text-gray-400 font-bold">{s.label}</p>
                  <p className="font-black text-[11px] text-primary truncate">{s.val}</p>
                </div>
              ))}
            </div>

            <Link href={`/profile/${item.donor?._id}`} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm hover:ring-2 ring-primary/10 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-50 border relative overflow-hidden flex items-center justify-center">
                  {item.donor?.avatar ? <Image src={item.donor.avatar} alt="avatar" fill className="object-cover" /> : <span className="material-symbols-outlined text-gray-300">account_circle</span>}
                </div>
                <div><h3 className="font-black text-sm group-hover:text-primary transition-colors">{item.donor?.name}</h3><p className="text-[10px] text-gray-400 font-bold">ملف المتبرع</p></div>
              </div>
              <span className="material-symbols-outlined text-gray-300 group-hover:-translate-x-1 transition-transform">chevron_left</span>
            </Link>

            <div className="space-y-4">
              {message.text && <div className={`p-4 rounded-2xl text-center text-xs font-bold border ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>{message.text}</div>}
              <div className="flex flex-col gap-3">
                {isDonor ? (
                  <div className="space-y-3">
                    <div className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold text-center border-2 border-dashed text-sm">هذا التبرع مقدم منك 🎁</div>
                    {item.status === "محجوز" && <button onClick={handleCancelAction} disabled={actionLoading} className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl text-xs font-bold hover:bg-red-100 transition-all">إلغاء حجز المستلم الحالي</button>}
                  </div>
                ) : item.status === "تم التسليم" ? (
                  <div className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-center text-sm">تم التسليم بنجاح ✅</div>
                ) : isCancelledBefore ? (
                  <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-center text-sm">لا يمكنك حجز هذا الغرض مرة أخرى 🚫</div>
                ) : isBooker ? (
                  <button onClick={handleCancelAction} disabled={actionLoading} className="w-full bg-red-50 text-red-600 border border-red-200 py-4 rounded-2xl font-black text-sm hover:bg-red-100 transition-all shadow-sm">إلغاء الحجز ⚠️</button>
                ) : isWaitlisted ? (
                  <button onClick={handleCancelAction} disabled={actionLoading} className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-4 rounded-2xl font-black text-sm hover:bg-orange-100 transition-all">الانسحاب من الانتظار 🚶‍♂️</button>
                ) : item.status === "متاح" ? (
                  <button onClick={handleRequestItem} disabled={actionLoading} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:bg-[#004d44] transition-all">احجز هذه القطعة الآن</button>
                ) : (
                  <button onClick={handleRequestItem} disabled={actionLoading} className="w-full bg-[#005a8c] text-white py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-[#004a75] transition-all">انضم لقائمة الانتظار 🕒</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}