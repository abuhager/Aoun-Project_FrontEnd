'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// تعريف نوع البيانات عشان نخلص من خطأ no-explicit-any
interface ItemType {
  _id: string;
  title?: string;
  name?: string;
  location?: string;
  category?: string;
  condition?: string;
  imageUrl?: string;
  image?: string;
}

export default function BrowsePage() {
  const router = useRouter();
  const [items, setItems] = useState<ItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);

  // ستيت الفلاتر
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // 1. نظام الحماية: إذا مش مسجل دخول، ارجع للهوم أو اللوجن
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?msg=يجب تسجيل الدخول لتصفح التبرعات');
    }
  }, [router]);

  // 2. جلب البيانات من الباك إند
 useEffect(() => {
  let isMounted = true; // لمنع تحديث الـ State إذا اليوزر طلع من الصفحة
  const fetchItems = async () => {
    try {
      const res = await axios.get('https://aoun-project-backend.onrender.com/api/items');
      if (isMounted) {
        setItems(res.data);
        setFilteredItems(res.data);
      }
    } catch (err) {
      console.error("خطأ في جلب البيانات");
    } finally {
      if (isMounted) setLoading(false);
    }
  };
  fetchItems();
  return () => { isMounted = false; }; // تنظيف (Cleanup)
}, []);

  // 3. لوجيك الفلترة التلقائي
  useEffect(() => {
    let result = items;
    if (selectedCity) result = result.filter((i) => i.location === selectedCity);
    if (selectedCategory) result = result.filter((i) => i.category === selectedCategory);
    if (searchQuery) {
      result = result.filter((i) => 
        i.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        i.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredItems(result);
  }, [searchQuery, selectedCity, selectedCategory, items]);

  return (
    <div className="bg-surface min-h-screen text-[#191c1d]" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-12 py-10 pt-28">
        
        {/* قسم البحث والفلاتر */}
        <section className="mb-16">
          <div className="bg-surface-container-low p-6 rounded-xl shadow-sm border border-[#edeeef]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input 
                  className="w-full pr-12 pl-4 py-4 bg-white border-none rounded-md focus:ring-2 focus:ring-primary/20 text-[#191c1d] outline-none shadow-sm" 
                  placeholder="ابحث عن غرض..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="md:col-span-3 relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                <select 
                  className="w-full pr-12 pl-4 py-4 bg-white border-none rounded-md appearance-none focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none shadow-sm"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">كل المدن</option>
                  <option>عمان</option><option>إربد</option><option>الزرقاء</option><option>العقبة</option>
                </select>
              </div>
              <div className="md:col-span-3 relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">category</span>
                <select 
                  className="w-full pr-12 pl-4 py-4 bg-white border-none rounded-md appearance-none focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none shadow-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">كل التصنيفات</option>
                  <option>إلكترونيات</option><option>كتب</option><option>ملابس</option><option>أثاث</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* العنوان والإحصائيات */}
        <section className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#191c1d] mb-2 font-headline">تصفح التبرعات المتاحة</h1>
            <p className="text-on-surface-variant">اكتشف الأدوات التعليمية والأساسيات التي يحتاجها زملائك الطلاب</p>
          </div>
          <div className="flex gap-4">
            <span className="bg-[#98f994]/30 text-[#0c7521] px-4 py-2 rounded-full text-sm font-bold border border-primary">
              {filteredItems.length} تبرع متاح حالياً
            </span>
          </div>
        </section>

        {/* شبكة الأغراض */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl border border-[#edeeef]">
                <div className="relative h-56 overflow-hidden">
                  {/* 🟢 تم استبدال img بـ Image حسب توصيات ESLint */}
                  <Image 
                    src={item.imageUrl || item.image || 'https://via.placeholder.com/300'} 
                    alt={item.title || item.name || 'صورة الغرض'} 
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-md">
                      {item.condition || 'مستعمل ممتاز'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#191c1d] mb-3 font-headline truncate">{item.title || item.name}</h3>
                  <div className="flex items-center text-on-surface-variant text-sm mb-6 gap-2">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span>{item.location || 'غير محدد'}</span>
                  </div>
                  <Link href={`/items/${item._id}`} className="w-full py-3 bg-primary text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary-container hover:shadow-lg transition-all active:scale-95">
                    <span>عرض التفاصيل</span>
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <Link href="/add-item" className="fixed bottom-8 left-8 bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform group z-50">
        <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">add</span>
      </Link>
    </div>
  );
}