'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = 'http://localhost:5000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/users/profile/${id}`);
        setProfileData(res.data);
      } catch (err) {
        console.error("خطأ في جلب البروفايل");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/300?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${backendUrl}/${url}`;
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-[#f8f9fa]"><div className="w-10 h-10 border-4 border-[#006155] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!profileData) return <div className="text-center py-20 font-bold bg-[#f8f9fa] min-h-screen"><Navbar /><div className="mt-32">🛑 هذا الحساب غير موجود</div></div>;

  const { user, stats, activeDonations } = profileData;

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#191c1d] font-body pb-20" dir="rtl">
      <Navbar />

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-5xl mx-auto">
        
        {/* 🟢 الهيدر (Cover & Avatar) */}
        <section className="relative mb-16 md:mb-20">
          {/* الكوفر الخلفي */}
          <div className="h-32 md:h-48 w-full rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#006155] to-[#087c6e] relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
          </div>
          
          {/* الصورة الشخصية */}
          <div className="absolute -bottom-10 md:-bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#f8f9fa] bg-white overflow-hidden shadow-lg flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
            ) : (
              <span className="material-symbols-outlined text-5xl md:text-6xl text-[#006155]">account_circle</span>
            )}
          </div>
        </section>

        {/* 🟢 بيانات المستخدم الأساسية */}
        <section className="text-center mb-10 md:mb-12 px-4">
          <h1 className="text-2xl md:text-3xl font-black font-headline text-[#191c1d] mb-2">{user.name}</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            {user.email?.includes('.edu') ? (
              <span className="flex items-center gap-1 bg-[#006e1c]/10 text-[#006e1c] px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border border-[#006e1c]/20">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>school</span> طالب موثق
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-gray-200 text-[#40493d] px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border border-gray-300">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span> مستخدم
              </span>
            )}
            <span className="text-[#40493d] text-xs">• انضم في {new Date(user.createdAt).getFullYear()}</span>
          </div>
        </section>

        {/* 🟢 إحصائيات المستخدم (Bento Grid) */}
        <section className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 mb-12 md:mb-16 max-w-2xl mx-auto">
          {/* نقاط الثقة */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-[#edeeef] text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
            <span className="text-[#40493d] font-bold text-xs md:text-sm mb-3">نقاط الثقة</span>
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-2">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-[#e7e8e9]" cx="50%" cy="50%" r="45%" fill="transparent" strokeWidth="5"></circle>
                <circle className="text-[#006155]" cx="50%" cy="50%" r="45%" fill="transparent" strokeWidth="5" strokeDasharray="283" strokeDashoffset={283 - (283 * (user.trustScore || 85)) / 100}></circle>
              </svg>
              <span className="absolute text-lg md:text-xl font-black">{user.trustScore || 85}</span>
            </div>
            <p className="text-[9px] md:text-[10px] text-[#006155] bg-[#006155]/10 px-2 py-1 rounded-md font-bold">موثوق جداً</p>
          </div>

          {/* إجمالي العطاء */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-[#edeeef] text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
            <span className="text-[#40493d] font-bold text-xs md:text-sm mb-2">إجمالي التبرعات</span>
            <span className="text-4xl md:text-5xl font-black text-[#006155] mb-2">{stats.donationsCount}</span>
            <div className="flex items-center gap-1 text-[#006e1c]">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
              <span className="text-[10px] md:text-xs font-bold">أثر مجتمعي</span>
            </div>
          </div>
        </section>

        {/* 🟢 الأغراض المتاحة للتبرع من هذا المستخدم */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-[#edeeef] pb-4">
            <span className="material-symbols-outlined text-[#006155]">inventory_2</span>
            <h2 className="text-lg md:text-xl font-bold font-headline">أغراض متاحة من {user.name.split(' ')[0]}</h2>
          </div>

          {activeDonations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {activeDonations.map((item: any) => (
                <Link href={`/items/${item._id}`} key={item._id} className="bg-white rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm border border-[#edeeef] flex flex-col">
                  <div className="relative h-32 md:h-40 overflow-hidden bg-gray-50">
                    <img src={getImageUrl(item.imageUrl || item.image)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-2 right-2"><span className="bg-[#006155]/90 text-white px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-bold">{item.condition || 'ممتاز'}</span></div>
                  </div>
                  <div className="p-3 md:p-4 flex flex-col flex-grow">
                    <span className="text-[9px] font-black text-[#006e1c] bg-green-50 px-2 py-0.5 rounded mb-2 inline-block self-start">{item.category || 'عام'}</span>
                    <h3 className="text-xs md:text-sm font-bold mb-2 md:mb-3 font-headline truncate">{item.title}</h3>
                    <div className="flex items-center text-[#40493d] text-[10px] md:text-xs mb-3 gap-1"><span className="material-symbols-outlined text-[12px] md:text-sm">location_on</span><span>{item.location || 'غير محدد'}</span></div>
                    <div className="w-full mt-auto py-1.5 md:py-2 bg-[#f3f4f5] text-[#006155] text-[10px] md:text-xs rounded-lg font-bold flex items-center justify-center gap-1 group-hover:bg-[#006155] group-hover:text-white transition-colors"><span>التفاصيل</span></div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#edeeef] shadow-sm">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">hourglass_empty</span>
              <p className="text-[#40493d] text-sm md:text-base font-bold">لا يوجد أغراض متاحة حالياً من هذا المستخدم.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}