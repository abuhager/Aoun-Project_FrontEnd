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
  const [message, setMessage] = useState('');

  // 1. الحماية
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push(`/login?redirect=/items/${id}`);
  }, [id, router]);

  // 2. جلب البيانات
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/items/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error("خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/600';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000/${url}`;
  };

  const handleRequestItem = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(`http://localhost:5000/api/items/book/${id}`, {}, {
        headers: { 'x-auth-token': token }
      });
      setMessage(res.data.msg);
    } catch (err: any) {
      setMessage(err.response?.data?.msg || "حدث خطأ أثناء الطلب");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="w-12 h-12 border-4 border-[#006155] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!item) return <div className="text-center py-20 font-bold">🛑 هذه القطعة غير موجودة</div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#191c1d]" dir="rtl">
      <Navbar />
      <main className="pt-24 pb-16 px-6 max-w-screen-2xl mx-auto font-body">
        <nav className="mb-8 flex items-center gap-2 text-[#40493d] text-sm font-medium">
          <Link className="hover:text-[#006155]" href="/browse">التبرعات</Link>
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          <span className="text-[#191c1d]">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="order-2 lg:order-1 flex flex-col gap-6">
            <div className="relative rounded-2xl overflow-hidden bg-white aspect-[4/3] flex items-center justify-center border border-[#edeeef] shadow-sm">
              <img src={getImageUrl(item.imageUrl || item.image)} className="w-full h-full object-cover" alt="Main" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#005a8c]/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#cee5ff] flex items-center justify-center text-[#005a8c]"><span className="material-symbols-outlined">bolt</span></div>
              <div><p className="font-bold text-[#005a8c]">أثر تبرعك</p><p className="text-[#40493d] text-sm">هذا الغرض سيساعد زميلاً لك في مسيرته الدراسية.</p></div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex flex-col gap-8">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-[#97f3e2] text-[#00201b] text-xs font-bold">{item.category}</span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#006155] font-headline">{item.title}</h1>
              <p className="text-[#40493d] text-lg leading-relaxed">{item.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{ label: 'الحالة', val: item.condition || 'ممتاز', ic: 'check_circle' }, { label: 'المدينة', val: item.location || 'عمان', ic: 'location_on' }, { label: 'القسم', val: item.category, ic: 'category' }].map((s, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border-b-4 border-[#006155] shadow-sm border border-[#edeeef]">
                  <span className="material-symbols-outlined text-[#006155] mb-2">{s.ic}</span>
                  <p className="text-xs text-[#40493d]">{s.label}</p><p className="font-bold">{s.val}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#f3f4f5] p-6 rounded-2xl flex items-center justify-between border border-[#e1e3e4]">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm"><img src={item.donor?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAH7T1oqzKCsAjGZaPPN6e-2QT2St0jHU9wqYc2ppU4S0xpOQEErHoWCcZMSWarkCWkwPZGv1arWh1BFeDumKPEuzBZXQlek9DLnXe5dYGWkjkKM_PeAcVUOnFBqAhNhlwJphFnWwEQfEdDux_fohwcQMwIvE64jX3V03sRaIqqcjl73KRgOMxLxriNceAuWQlKxr-neizwHTB4zKfiB0Driz87-GARoTB_bIQ4d6TNkRmmzQp3FW4hG-S_O5SZToMfVMvKejhy9BI"} className="object-cover w-full h-full" /></div>
                <div><h3 className="font-bold text-lg">{item.donor?.name || 'متبرع عون'}</h3><span className="px-2 py-0.5 bg-[#006e1c]/10 text-[#006e1c] text-xs rounded-md font-bold">طالب موثق</span></div>
              </div>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90"><circle className="text-gray-200" cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" /><circle className="text-[#006e1c]" cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * (item.donor?.trustScore || 85)) / 100} /></svg>
                  <span className="absolute text-sm font-bold">{item.donor?.trustScore || 85}</span>
                </div>
                <p className="text-[10px] font-bold text-[#40493d] mt-1">Trust Score</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {message && <div className="p-4 bg-[#97f3e2]/30 text-[#005047] rounded-xl text-center font-bold border border-[#97f3e2]">{message}</div>}
              <button onClick={handleRequestItem} className="bg-gradient-to-br from-[#006155] to-[#087c6e] text-white text-xl py-5 rounded-full font-bold shadow-xl hover:scale-[0.98] transition-all flex items-center justify-center gap-3">
                <span className="material-symbols-outlined">volunteer_activism</span> اطلب هذه القطعة
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}