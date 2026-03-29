'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BrowsePage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // 1. حارس البوابة: إذا مش مسجل دخول، ارجع للوجن
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?msg=يجب تسجيل الدخول لتصفح التبرعات');
    }
  }, [router]);

  // 2. جلب البيانات من الباك إند
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/items');
        setItems(res.data);
        setFilteredItems(res.data);
      } catch (err) {
        console.error("خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // 3. لوجيك الفلترة التلقائي
  useEffect(() => {
    let result = items;
    if (selectedCity) result = result.filter((i: any) => i.location === selectedCity);
    if (selectedCategory) result = result.filter((i: any) => i.category === selectedCategory);
    if (searchQuery) {
      result = result.filter((i: any) => 
        (i.title || i.name)?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredItems(result);
  }, [searchQuery, selectedCity, selectedCategory, items]);

  // 🟢 دالة ذكية لمعالجة رابط الصورة
  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/300?text=No+Image';
    if (url.startsWith('http')) return url; // Cloudinary
    return `http://localhost:5000/${url}`; // Local Server (uploads/)
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#191c1d]" dir="rtl">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-12 py-10 pt-28">
        
        {/* قسم البحث */}
        <section className="mb-16">
          <div className="bg-[#f3f4f5] p-6 rounded-xl shadow-sm border border-[#edeeef]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#707a6c]">search</span>
                <input className="w-full pr-12 pl-4 py-4 bg-white border-none rounded-md focus:ring-2 focus:ring-[#006155]/20 outline-none" placeholder="ابحث عن غرض..." type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="md:col-span-3 relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#707a6c]">location_on</span>
                <select className="w-full pr-12 pl-4 py-4 bg-white border-none rounded-md appearance-none focus:ring-2 focus:ring-[#006155]/20 cursor-pointer" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                  <option value="">كل المدن</option>
                  <option>عمان</option><option>إربد</option><option>الزرقاء</option><option>العقبة</option>
                </select>
              </div>
              <div className="md:col-span-3 relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#707a6c]">category</span>
                <select className="w-full pr-12 pl-4 py-4 bg-white border-none rounded-md appearance-none focus:ring-2 focus:ring-[#006155]/20 cursor-pointer" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="">كل التصنيفات</option>
                  <option>إلكترونيات</option><option>كتب</option><option>ملابس</option><option>أثاث</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <button className="w-full h-full py-4 bg-[#006155] text-white rounded-md flex items-center justify-center hover:bg-[#087c6e] shadow-md"><span className="material-symbols-outlined">tune</span></button>
              </div>
            </div>
          </div>
        </section>

        {/* النتائج */}
        <section className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div><h1 className="text-4xl font-extrabold mb-2 font-headline">تصفح التبرعات</h1><p className="text-[#40493d]">اكتشف ما يحتاجه زملائك الطلاب</p></div>
          <span className="bg-[#98f994]/30 text-[#0c7521] px-4 py-2 rounded-full text-sm font-bold border border-[#98f994]">{filteredItems.length} تبرع متاح</span>
        </section>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-[#006155] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredItems.map((item: any) => (
              <div key={item._id} className="bg-white rounded-xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300 shadow-sm border border-[#edeeef]">
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img src={getImageUrl(item.imageUrl || item.image)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-4 left-4"><span className="bg-[#006155]/90 text-white px-3 py-1 rounded-full text-xs font-bold">{item.condition || 'مستعمل ممتاز'}</span></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 font-headline truncate">{item.title || item.name}</h3>
                  <div className="flex items-center text-[#40493d] text-sm mb-6 gap-2"><span className="material-symbols-outlined text-base">location_on</span><span>{item.location || 'غير محدد'}</span></div>
                  <Link href={`/items/${item._id}`} className="w-full py-3 bg-[#006155] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#087c6e]"><span>التفاصيل</span><span className="material-symbols-outlined text-lg">arrow_back</span></Link>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}