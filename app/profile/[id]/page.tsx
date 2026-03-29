'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('donations'); // التبويب الافتراضي
  const [loading, setLoading] = useState(true);

  const backendUrl = 'http://localhost:5000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/auth/profile/${id}`);
        setProfileData(res.data);
      } catch (err) {
        console.error("خطأ في جلب البروفايل");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-[#f8f9fa]"><div className="w-10 h-10 border-4 border-[#006155] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!profileData) return <div className="text-center py-20 bg-[#f8f9fa] min-h-screen"><Navbar /><div className="mt-32 font-bold">🛑 هذا الحساب غير موجود</div></div>;

  const { user, stats, allDonations, completedRequests } = profileData;

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/300?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${backendUrl}/${url}`;
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#191c1d] font-body pb-20" dir="rtl">
      <Navbar />

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-5xl mx-auto">
        
        {/* هيدر البروفايل - نفس التصميم السابق */}
        <section className="relative mb-16">
          <div className="h-32 md:h-48 w-full rounded-2xl bg-gradient-to-r from-[#006155] to-[#087c6e] shadow-sm"></div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#f8f9fa] bg-white overflow-hidden shadow-lg flex items-center justify-center">
            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-5xl text-[#006155]">account_circle</span>}
          </div>
        </section>

        <section className="text-center mb-10">
          <h1 className="text-2xl font-black">{user.name}</h1>
          <p className="text-xs text-gray-500 mt-1">انضم في {new Date(user.createdAt).getFullYear()}</p>
        </section>

        {/* Bento Stats */}
        <section className="grid grid-cols-3 gap-3 md:gap-6 mb-12">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
            <span className="text-2xl font-black text-[#006155]">{user.trustScore || 85}</span>
            <p className="text-[10px] font-bold text-gray-500 uppercase">نقاط الثقة</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
            <span className="text-2xl font-black text-[#006155]">{stats.donationsCount}</span>
            <p className="text-[10px] font-bold text-gray-500 uppercase">إجمالي العطاء</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
            <span className="text-2xl font-black text-[#005a8c]">{stats.receivedCount}</span>
            <p className="text-[10px] font-bold text-gray-500 uppercase">أغراض مستلمة</p>
          </div>
        </section>

        {/* 🟢 نظام التبويبات (Tabs) الجديد */}
        <section>
          <div className="flex border-b border-gray-200 mb-6 gap-6">
            <button onClick={() => setActiveTab('donations')} className={`pb-3 font-bold text-sm transition-all ${activeTab === 'donations' ? 'text-[#006155] border-b-2 border-[#006155]' : 'text-gray-400'}`}>سجل التبرعات</button>
            <button onClick={() => setActiveTab('requests')} className={`pb-3 font-bold text-sm transition-all ${activeTab === 'requests' ? 'text-[#006155] border-b-2 border-[#006155]' : 'text-gray-400'}`}>أغراض استلمها</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(activeTab === 'donations' ? allDonations : completedRequests).map((item: any) => (
              <Link href={`/items/${item._id}`} key={item._id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group">
                <div className="relative h-32 overflow-hidden bg-gray-50">
                  <img src={getImageUrl(item.imageUrl)} className={`w-full h-full object-cover ${item.status === 'تم التسليم' ? 'grayscale opacity-60' : ''}`} />
                  {/* 🟢 شارة الحالة (ما بيختفي، بتتغير حالته) */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold text-white ${
                      item.status === 'تم التسليم' ? 'bg-gray-500' : 
                      item.status === 'محجوز' ? 'bg-[#005a8c]' : 'bg-[#006155]'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold truncate mb-1">{item.title}</h3>
                  <span className="text-[9px] text-gray-400 block">{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </Link>
            ))}
          </div>

          {(activeTab === 'donations' ? allDonations : completedRequests).length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm italic">لا يوجد سجلات لعرضها حالياً.</div>
          )}
        </section>

      </main>
    </div>
  );
}