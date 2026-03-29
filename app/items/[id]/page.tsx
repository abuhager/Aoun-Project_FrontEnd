'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);
  
  // 🟢 ستيت جديدة لمعرفة الـ ID تبع المستخدم الحالي
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const backendUrl = 'http://localhost:5000';

  const fetchItem = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/items/${id}`);
      setItem(res.data);
    } catch (err) {
      console.error("خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🟢 فك التشفير عن التوكن لمعرفة مين اليوزر اللي فاتح الصفحة
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user.id);
      } catch (e) {
        console.error("خطأ في قراءة التوكن");
      }
    }
    
    if (id) fetchItem();
  }, [id]);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/600?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${backendUrl}/${url}`;
  };

  const handleRequestItem = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push(`/login?redirect=/items/${id}`);

    try {
      setActionLoading(true);
      const res = await axios.put(`${backendUrl}/api/items/book/${id}`, {}, { headers: { 'x-auth-token': token } });
      setMessage({ type: 'success', text: res.data.msg });
      fetchItem(); 
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.msg || "حدث خطأ أثناء الطلب" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('هل أنت متأكد أنك تريد إلغاء طلبك لهذا الغرض؟')) return;
    const token = localStorage.getItem('token');
    
    try {
      setActionLoading(true);
      const res = await axios.put(`${backendUrl}/api/items/cancel/${id}`, {}, { headers: { 'x-auth-token': token } });
      setMessage({ type: 'success', text: res.data.msg });
      fetchItem(); 
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.msg || "حدث خطأ أثناء الإلغاء" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-[#f8f9fa]"><div className="w-10 h-10 border-4 border-[#006155] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!item) return <div className="text-center py-20 font-bold">🛑 القطعة غير موجودة</div>;

  // 🟢 اللوجيك الذكي لمعرفة علاقة اليوزر الحالي بالقطعة
  const isDonor = item?.donor?._id === currentUserId; // هل أنا صاحب القطعة؟
  const isBooker = item?.bookedBy === currentUserId; // هل أنا اللي حجزتها؟
  const isWaitlisted = item?.waitlist?.some((w: any) => w.user === currentUserId); // هل أنا بالطابور؟

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#191c1d] font-body" dir="rtl">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
        <nav className="mb-4 md:mb-6 flex items-center gap-2 text-[#40493d] text-xs md:text-sm font-medium">
          <Link className="hover:text-[#006155]" href="/browse">التبرعات</Link>
          <span className="material-symbols-outlined text-[10px] md:text-xs">chevron_left</span>
          <span className="text-[#191c1d] truncate max-w-[150px] md:max-w-xs">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-start">
          <div className="order-2 lg:order-1 flex flex-col gap-4 md:gap-6">
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-white aspect-video md:aspect-square border border-[#edeeef] shadow-sm">
              <img src={getImageUrl(item.imageUrl || item.image)} className="w-full h-full object-cover" alt={item.title} />
            </div>
          </div>

          <div className="order-1 lg:order-2 flex flex-col gap-5 md:gap-6">
            <div className="space-y-2 md:space-y-3">
              <span className="px-3 py-1 rounded-md bg-[#97f3e2]/30 text-[#00201b] text-[10px] md:text-xs font-bold inline-block border border-[#97f3e2]">{item.category}</span>
              <h1 className="text-2xl md:text-4xl font-black text-[#006155] font-headline leading-tight">{item.title}</h1>
              <p className="text-sm md:text-base text-[#40493d] leading-relaxed">{item.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[{ label: 'الحالة', val: item.condition || 'مستعمل ممتاز', ic: 'check_circle' }, { label: 'المدينة', val: item.location || 'عمان', ic: 'location_on' }, { label: 'القسم', val: item.category, ic: 'category' }].map((s, i) => (
                <div key={i} className="bg-white p-3 md:p-4 rounded-xl border-b-2 border-[#006155] shadow-sm border border-[#edeeef] text-center">
                  <span className="material-symbols-outlined text-[#006155] text-lg md:text-xl mb-1">{s.ic}</span>
                  <p className="text-[9px] md:text-[10px] text-[#40493d] mb-0.5">{s.label}</p>
                  <p className="font-bold text-xs md:text-sm truncate">{s.val}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 md:p-5 rounded-2xl flex items-center justify-between border border-[#edeeef] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-slate-100 overflow-hidden border border-gray-100 flex items-center justify-center">
                  {item.donor?.avatar ? <img src={item.donor.avatar} className="object-cover w-full h-full" /> : <span className="material-symbols-outlined text-gray-400">person</span>}
                </div>
                <div><h3 className="font-bold text-sm md:text-base">{item.donor?.name || 'متبرع عون'}</h3><span className="px-2 py-0.5 bg-[#006e1c]/10 text-[#006e1c] text-[8px] md:text-[10px] rounded font-bold uppercase">طالب موثق</span></div>
              </div>
              <div className="text-center">
                <span className="text-lg md:text-xl font-black text-[#006e1c] block">{item.donor?.trustScore || 85}</span>
                <p className="text-[8px] md:text-[10px] font-bold text-[#40493d]">نقاط الثقة</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 pt-2">
              {message.text && (
                <div className={`p-3 md:p-4 rounded-xl text-center text-xs md:text-sm font-bold border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : message.text.includes('الانتظار') ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {message.text}
                </div>
              )}
              
              {/* 🟢 عرض الأزرار بناءً على علاقة المستخدم بالقطعة */}
              <div className="flex flex-col gap-3 w-full">
                {isDonor ? (
                  <div className="w-full py-4 bg-gray-100 text-[#40493d] rounded-full font-bold text-center border border-gray-200 text-sm md:text-base">
                    هذا التبرع خاص بك 🎁
                  </div>
                ) : item.status === 'تم التسليم' ? (
                  <button disabled className="w-full bg-gray-400 text-white text-sm md:text-base py-3 md:py-4 rounded-full font-bold cursor-not-allowed">
                    تم التسليم
                  </button>
                ) : isBooker ? (
                  <button 
                    disabled={actionLoading}
                    onClick={handleCancelBooking} 
                    className="w-full bg-red-50 text-red-600 border border-red-200 text-sm md:text-base py-3 md:py-4 rounded-full font-bold hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">cancel</span> إلغاء حجز القطعة
                  </button>
                ) : isWaitlisted ? (
                  <button 
                    disabled={actionLoading}
                    onClick={handleCancelBooking} 
                    className="w-full bg-orange-50 text-orange-600 border border-orange-200 text-sm md:text-base py-3 md:py-4 rounded-full font-bold hover:bg-orange-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">person_remove</span> الانسحاب من الطابور
                  </button>
                ) : item.status === 'متاح' ? (
                  <button 
                    disabled={actionLoading} 
                    onClick={handleRequestItem} 
                    className="w-full bg-[#006155] hover:bg-[#087c6e] text-white text-sm md:text-base py-3 md:py-4 rounded-full font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {actionLoading ? 'جاري المعالجة...' : <><span className="material-symbols-outlined text-lg">volunteer_activism</span> اطلب هذه القطعة</>}
                  </button>
                ) : item.status === 'محجوز' ? (
                  <button 
                    disabled={actionLoading} 
                    onClick={handleRequestItem} 
                    className="w-full bg-[#005a8c] hover:bg-[#004a75] text-white text-sm md:text-base py-3 md:py-4 rounded-full font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {actionLoading ? 'جاري المعالجة...' : <><span className="material-symbols-outlined text-lg">hourglass_empty</span> الانضمام لطابور الانتظار</>}
                  </button>
                ) : null}
              </div>

              <p className="text-[10px] md:text-xs text-center text-gray-500 italic mt-2">
                {isDonor ? 'هذا الغرض معروض للطلاب في المنصة.' :
                 isBooker ? 'يرجى التنسيق مع المتبرع للاستلام.' :
                 isWaitlisted ? 'سنقوم بإبلاغك في حال إلغاء الحجز لتتمكن من استلام القطعة.' :
                 item.status === 'متاح' ? 'سيصلك رمز استلام لتأكيد العملية عند اللقاء.' : 
                 item.status === 'محجوز' ? 'القطعة محجوزة، لكن يمكنك الانضمام للطابور في حال أُلغي الحجز.' : ''}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}