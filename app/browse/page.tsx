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

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login?msg=يجب تسجيل الدخول');
  }, [router]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/items')
      .then(res => { setItems(res.data); setFilteredItems(res.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = items;
    if (selectedCity) result = result.filter((i: any) => i.location === selectedCity);
    if (selectedCategory) result = result.filter((i: any) => i.category === selectedCategory);
    if (searchQuery) result = result.filter((i: any) => (i.title || i.name)?.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredItems(result);
  }, [searchQuery, selectedCity, selectedCategory, items]);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/300';
    return url.startsWith('http') ? url : `http://localhost:5000/${url}`;
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#191c1d]" dir="rtl">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 pt-20 md:pt-24 font-body">
        
        {/* Search Section - Sleek */}
        <section className="mb-8 md:mb-12 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-[#edeeef]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center text-sm">
            <div className="md:col-span-5 relative">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input className="w-full pr-10 pl-4 py-3 bg-[#f3f4f5] border-none rounded-xl focus:ring-2 focus:ring-[#006155]/20 outline-none" placeholder="ابحث عن غرض..." type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="md:col-span-3 relative">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">location_on</span>
              <select className="w-full pr-10 pl-4 py-3 bg-[#f3f4f5] border-none rounded-xl appearance-none focus:ring-2 focus:ring-[#006155]/20 cursor-pointer" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                <option value="">كل المدن</option><option>عمان</option><option>إربد</option><option>الزرقاء</option><option>العقبة</option>
              </select>
            </div>
            <div className="md:col-span-3 relative">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">category</span>
              <select className="w-full pr-10 pl-4 py-3 bg-[#f3f4f5] border-none rounded-xl appearance-none focus:ring-2 focus:ring-[#006155]/20 cursor-pointer" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">كل التصنيفات</option><option>إلكترونيات</option><option>كتب</option><option>ملابس</option><option>أثاث</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <button className="w-full py-3 bg-[#006155] text-white rounded-xl flex items-center justify-center hover:bg-[#087c6e] shadow-sm transition-colors"><span className="material-symbols-outlined text-lg">tune</span></button>
            </div>
          </div>
        </section>

        {/* Header */}
        <section className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4">
          <div><h1 className="text-2xl md:text-3xl font-extrabold mb-1 font-headline">تصفح التبرعات</h1><p className="text-xs md:text-sm text-[#40493d]">اكتشف ما يحتاجه زملاؤك</p></div>
          <span className="bg-[#98f994]/20 text-[#0c7521] px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold border border-[#98f994]/50">{filteredItems.length} تبرع متاح</span>
        </section>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#006155] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            
            {/* حالة عدم وجود نتائج (Empty State) */}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-[#edeeef] shadow-sm">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
                <h3 className="text-lg font-bold text-[#191c1d] mb-2">لا توجد نتائج مطابقة لبحثك</h3>
                <p className="text-sm text-[#40493d] mb-4">حاول استخدام كلمات مفتاحية أخرى أو تغيير الفلاتر.</p>
                <button onClick={() => {setSearchQuery(''); setSelectedCity(''); setSelectedCategory('');}} className="px-6 py-2 bg-[#f3f4f5] text-[#006155] rounded-full text-sm font-bold hover:bg-[#e1e3e4] transition-colors">مسح الفلاتر</button>
              </div>
            )}

            {filteredItems.map((item: any) => (
              <Link href={`/items/${item._id}`} key={item._id} className="bg-white rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm border border-[#edeeef] flex flex-col">
                <div className="relative h-32 md:h-40 overflow-hidden bg-gray-50">
                  <img src={getImageUrl(item.imageUrl || item.image)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  {/* شريط حالة الغرض (جديد) */}
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-1 items-end">
                    <span className="bg-[#006155]/90 text-white px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-bold">{item.condition || 'ممتاز'}</span>
                    {item.status === 'محجوز' && (
                      <span className="bg-[#005a8c]/90 text-white px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-bold">محجوز للطابور 🕒</span>
                    )}
                  </div>
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-grow">
                  {/* التصنيف (كان مفقود ورجعناه) */}
                  <span className="text-[9px] font-black text-[#006e1c] bg-green-50 px-2 py-0.5 rounded mb-2 inline-block self-start">{item.category || 'عام'}</span>
                  
                  <h3 className="text-xs md:text-sm font-bold mb-2 md:mb-3 font-headline truncate">{item.title || item.name}</h3>
                  <div className="flex items-center text-[#40493d] text-[10px] md:text-xs mb-3 md:mb-4 gap-1"><span className="material-symbols-outlined text-[12px] md:text-sm">location_on</span><span>{item.location || 'غير محدد'}</span></div>
                  
                  <div className="w-full mt-auto py-1.5 md:py-2 bg-[#f3f4f5] text-[#006155] text-[10px] md:text-xs rounded-lg font-bold flex items-center justify-center gap-1 group-hover:bg-[#006155] group-hover:text-white transition-colors"><span>التفاصيل</span></div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}