'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';

// 1. تعريف الأنواع
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
  donor: Donor;
  bookedBy?: { _id: string } | string;
  waitlist: WaitlistEntry[];
}

// 🟢 دالة مساعدة (Helper) لتوحيد استخراج الـ ID
const getUserId = (userField: any): string | null => {
  if (!userField) return null;
  return typeof userField === 'object' ? userField._id : userField;
};

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const backendUrl = 'https://aoun-project-backend.onrender.com';

  // 2. استخدام useCallback لجلب البيانات بكفاءة
  const fetchItem = useCallback(async (isMounted: boolean = true) => {
    try {
      const res = await axios.get(`${backendUrl}/api/items/${id}`);
      if (isMounted) setItem(res.data);
    } catch {
      console.error("خطأ في جلب البيانات");
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true; // 🟢 لمنع Memory Leak
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user.id);
      } catch {
        console.error("خطأ في قراءة التوكن");
      }
    }
    
    if (id) fetchItem(isMounted);

    return () => { isMounted = false; }; // 🟢 تنظيف عند مغادرة الصفحة
  }, [id, fetchItem]);

  // 🟢 استخراج الحالات المنطقية بشكل نظيف وموحد
  const isDonor = getUserId(item?.donor) === currentUserId;
  const isBooker = getUserId(item?.bookedBy) === currentUserId;
  const isWaitlisted = item?.waitlist?.some((w) => getUserId(w.user) === currentUserId);

  const handleRequestItem = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push(`/login?redirect=/items/${id}`);

    try {
      setActionLoading(true);
      const res = await axios.put(`${backendUrl}/api/items/book/${id}`, {}, { headers: { 'x-auth-token': token } });
      setMessage({ type: 'success', text: res.data.msg });
      fetchItem(); 
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage({ type: 'error', text: err.response?.data?.msg || "حدث خطأ أثناء الطلب" });
      } else {
        setMessage({ type: 'error', text: "حدث خطأ غير متوقع" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAction = async () => {
    // 🟢 استخدام المتغير المنطقي الموحد
    const confirmText = isBooker 
      ? 'هل أنت متأكد أنك تريد إلغاء حجزك لهذه القطعة؟' 
      : 'هل أنت متأكد أنك تريد الانسحاب من قائمة الانتظار؟';
      
    if (!confirm(confirmText)) return;
    
    const token = localStorage.getItem('token');
    try {
      setActionLoading(true);
      const res = await axios.put(`${backendUrl}/api/items/cancel/${id}`, {}, { headers: { 'x-auth-token': token } });
      setMessage({ type: 'success', text: res.data.msg });
      fetchItem(); 
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage({ type: 'error', text: err.response?.data?.msg || "حدث خطأ أثناء العملية" });
      } else {
        setMessage({ type: 'error', text: "حدث خطأ غير متوقع" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!item) return <div className="text-center py-20 font-bold">🛑 القطعة غير موجودة</div>;

  return (
    <div className="bg-surface min-h-screen text-[#191c1d] font-body pb-20" dir="rtl">
      <Navbar />
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-5xl mx-auto">
        
        <nav className="mb-6 flex items-center gap-2 text-on-surface-variant text-xs md:text-sm font-medium">
          <Link className="hover:text-primary transition-colors" href="/browse">تصفح التبرعات</Link>
          <span className="material-symbols-outlined text-[10px] md:text-xs text-gray-400">chevron_left</span>
          <span className="text-[#191c1d] font-bold truncate max-w-37.5 md:max-w-xs">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          
          <div className="flex flex-col gap-4">
            <div className="relative rounded-3xl overflow-hidden bg-white aspect-square border border-[#edeeef] shadow-sm group">
              {item.imageUrl ? (
                <Image 
  src={item.imageUrl.startsWith('http') ? item.imageUrl : `${backendUrl}/${item.imageUrl}`} 
  alt={item.title} 
  fill 
  priority // ✅ لأنها أهم صورة بالصفحة (LCP)
  sizes="(max-width: 768px) 100vw, 50vw" // ✅ موبايل عرض كامل، لابتوب نصف العرض
  className="object-cover group-hover:scale-105 transition-transform duration-500"
  // شيل unoptimized إذا بدك Next.js يضغط الصورة
/>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <span className="material-symbols-outlined text-6xl text-gray-200">image</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                 <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200">{item.category}</span>
                 {item.condition && <span className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-bold border border-primary/10">{item.condition}</span>}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#191c1d] font-headline leading-tight">{item.title}</h1>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">{item.description}</p>
            </div>

            {item.status === 'محجوز' && item.waitlist?.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                 <span className="material-symbols-outlined text-orange-600 text-lg">groups</span>
                 <p className="text-xs font-bold text-orange-700">هناك {item.waitlist.length} طلاب في قائمة الانتظار لهذا الغرض.</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[{ label: 'الموقع', val: item.location, ic: 'distance' }, { label: 'التاريخ', val: new Date(item.createdAt).toLocaleDateString('ar-EG'), ic: 'event' }, { label: 'الموثوقية', val: item.donor?.trustScore + '%', ic: 'verified_user' }].map((s, i) => (
                <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100 text-center shadow-sm">
                  <span className="material-symbols-outlined text-primary text-xl mb-1">{s.ic}</span>
                  <p className="text-[9px] text-gray-400 font-bold mb-0.5">{s.label}</p>
                  <p className="font-black text-[11px] truncate text-primary">{s.val}</p>
                </div>
              ))}
            </div>

            <Link href={`/profile/${item.donor?._id}`} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm hover:ring-2 ring-primary/10 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden relative">
                  {item.donor?.avatar ? (
                    <Image src={item.donor.avatar} alt={item.donor.name} fill className="object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-gray-300 text-3xl">account_circle</span>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-sm group-hover:text-primary transition-colors">{item.donor?.name}</h3>
                  {(item.donor?.trustScore ?? 0) >= 90 && (
                    <div className="flex items-center gap-1 mt-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full w-max border border-blue-100">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      <span className="text-[9px] font-black tracking-wide">عضو موثوق</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-300 group-hover:-translate-x-1 transition-transform">chevron_left</span>
            </Link>

            <div className="space-y-4 mt-2">
              {message.text && (
                <div className={`p-4 rounded-2xl text-center text-xs font-bold border animate-pulse ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {isDonor ? (
                  <div className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold text-center border-2 border-dashed border-gray-200 text-sm">
                    هذا الغرض معروض من قبلك 🎁
                  </div>
                ) : item.status === 'تم التسليم' ? (
                  <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-center border border-gray-200 text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">task_alt</span> تم تسليم هذا التبرع
                  </div>
                ) : isBooker ? (
                  <button onClick={handleCancelAction} disabled={actionLoading} className="w-full bg-red-50 text-red-600 border border-red-200 py-4 rounded-2xl font-black text-sm hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">cancel</span> إلغاء الحجز الحالي
                  </button>
                ) : isWaitlisted ? (
                  <button onClick={handleCancelAction} disabled={actionLoading} className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-4 rounded-2xl font-black text-sm hover:bg-orange-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">person_remove</span> الانسحاب من الانتظار
                  </button>
                ) : item.status === 'متاح' ? (
                  <button onClick={handleRequestItem} disabled={actionLoading} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:bg-[#004d44] transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">shopping_cart_checkout</span>
                    {actionLoading ? 'جاري الحجز...' : 'احجز هذه القطعة الآن'}
                  </button>
                ) : item.status === 'محجوز' ? (
                  <button onClick={handleRequestItem} disabled={actionLoading} className="w-full bg-[#005a8c] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-[#005a8c]/20 hover:bg-[#004a75] transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">notification_add</span>
                    {actionLoading ? 'جاري الإضافة...' : 'انضم لقائمة الانتظار'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}