'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function HomePage() {
  // 🟢 المتغيرات اللي بتتحكم بالداتا وحالة التحميل
  const [itemsFromDB, setItemsFromDB] = useState([]);
  const [loading, setLoading] = useState(true);

  // رابط الباك إند الأساسي (عشان الصور المحلية)
  const backendBaseUrl = 'http://localhost:5000';

  // 🟢 جلب البيانات من الباك إند
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${backendBaseUrl}/api/items`);
        // نبعت الداتا المباشرة لأن الباك إند ببعت Array
        setItemsFromDB(res.data); 
      } catch (error) {
        console.error('خطأ في جلب الأغراض:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] antialiased overflow-x-hidden" dir="rtl">
      <Navbar />

      <main className="mt-20">
        {/* Hero Section */}
        <section className="relative min-h-[870px] flex items-center pt-12 pb-24 overflow-hidden">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div className="z-10 order-2 md:order-1">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#98f994]/30 text-[#0c7521] text-sm font-bold mb-6">منصة مجتمعية موثوقة</span>
              <h1 className="text-5xl md:text-7xl font-black font-headline leading-tight text-[#006155] mb-6">فائضك..<br/><span className="text-[#006e1c]">عونٌ لغيرك</span></h1>
              <p className="text-lg md:text-xl text-[#40493d] leading-relaxed mb-10 max-w-lg">منصة مجتمعية قائمة على الثقة، تهدف لتسهيل عملية التبرع واستلام المواد الأساسية مجاناً وبكل كرامة.</p>
              
              {/* 🟢 تفعيل كبسات الـ Hero وتحويلها لـ Links بنفس الـ CSS */}
              <div className="flex flex-wrap gap-4">
                <Link href="/add-item" className="px-10 py-4 rounded-full bg-gradient-to-br from-[#006155] to-[#087c6e] text-white text-lg font-bold shadow-lg shadow-[#006155]/20 hover:shadow-xl transition-all text-center inline-block">
                  تبرع الآن
                </Link>
                <Link href="/browse" className="px-10 py-4 rounded-full bg-[#e1e3e4] text-[#005047] text-lg font-bold hover:bg-[#d9dadb] transition-all text-center inline-block">
                  تصفح الاحتياجات
                </Link>
              </div>
            </div>
            <div className="relative order-1 md:order-2">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#006155]/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-[#005a8c]/10 rounded-full blur-3xl"></div>
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl transform rotate-2">
                {/* حافظنا على الرابط الاستاتيكي للصورة الكبيرة في الـ Hero بناءً على طلبك */}
                <img alt="People helping each other" className="w-full h-[500px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw93s688quPK_GYTpPLVuSdOuokxVL_kAEivbgOMp05gcClG9rq12hyXUKaJ6o-vOhIVnNa2iO3Q926aEr96kORDXKkSSDf5d5v2b7l5TUI21FmHiZgUTvjTL9i9bnVEOLon-77Yp0iiQFKoHLR0XH7m-bHSzYURzpNqjGxPGeiYuHUY5r6gyOJxsFw3LUeO3EuWJ4cmgZMlxDEITYj1_ZXiFjdVC0kaqRx16gNtmg2xfy19b0aw1EEhC3M7NMoT3Ot0bQHMTgiXA" />
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl flex items-center gap-4 border border-white/20 bg-white/30 backdrop-blur-md">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#006155] to-[#087c6e] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#006155]">أكثر من +٥,٠٠٠</p>
                    <p className="text-xs text-[#40493d] font-bold">عملية تبادل تمت بنجاح</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section (بدون تغيير) */}
        <section className="py-24 bg-[#f3f4f5]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black font-headline text-[#006155] mb-4">كيف تعمل منصة عون؟</h2>
              <div className="w-24 h-1.5 bg-gradient-to-br from-[#006155] to-[#087c6e] mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24">
              <div className="bg-white p-10 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-20 h-20 rounded-2xl bg-[#006155]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#006155] text-4xl">person_add</span>
                </div>
                <h3 className="text-xl font-bold mb-3">سجل حسابك</h3>
                <p className="text-[#40493d] text-sm leading-relaxed">انضم لمجتمعنا بخطوات بسيطة وآمنة لحماية خصوصيتك.</p>
              </div>
              <div className="bg-white p-10 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-20 h-20 rounded-2xl bg-[#006155]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#006155] text-4xl">add_box</span>
                </div>
                <h3 className="text-xl font-bold mb-3">أضف غرضاً أو اطلبه</h3>
                <p className="text-[#40493d] text-sm leading-relaxed">اعرض ما لا تحتاجه أو تصفح ما يحتاجه الآخرون بكل سهولة.</p>
              </div>
              <div className="bg-white p-10 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-20 h-20 rounded-2xl bg-[#006155]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#006155] text-4xl">handshake</span>
                </div>
                <h3 className="text-xl font-bold mb-3">تم اللقاء والتبادل</h3>
                <p className="text-[#40493d] text-sm leading-relaxed">نسق موعد الاستلام في مكان عام وآمن للجميع.</p>
              </div>
              <div className="bg-white p-10 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-20 h-20 rounded-2xl bg-[#006155]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#006155] text-4xl">star</span>
                </div>
                <h3 className="text-xl font-bold mb-3">قيّم تجربتك</h3>
                <p className="text-[#40493d] text-sm leading-relaxed">ساهم في بناء مجتمع الثقة من خلال تقييم التبادل.</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="col-span-1 bg-[#006e1c] text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-end min-h-[250px]">
                <span className="material-symbols-outlined absolute top-6 right-6 text-6xl opacity-20">school</span>
                <h4 className="text-2xl font-bold mb-2">هوية موثقة للطلاب</h4>
                <p className="text-white/80">دعم خاص للطلاب من خلال ربط حساباتهم الجامعية الموثقة.</p>
              </div>
              <div className="col-span-1 bg-[#0073b2] text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-end min-h-[250px]">
                <span className="material-symbols-outlined absolute top-6 right-6 text-6xl opacity-20">account_balance_wallet</span>
                <h4 className="text-2xl font-bold mb-2">نظام الحصص (Quota)</h4>
                <p className="text-white/80">نظام عادل يضمن وصول المساعدات لأكبر عدد ممكن من المستحقين.</p>
              </div>
              <div className="col-span-1 bg-[#006155] text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-end min-h-[250px]">
                <span className="material-symbols-outlined absolute top-6 right-6 text-6xl opacity-20">verified_user</span>
                <h4 className="text-2xl font-bold mb-2">مجتمع آمن وموثوق</h4>
                <p className="text-white/80">نحرص على التحقق من هوية المستخدمين لضمان تجربة آمنة للجميع.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Donations Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black font-headline text-[#006155] mb-2">أحدث الإضافات</h2>
                <p className="text-[#40493d]">اكتشف ما تمت إضافته حديثاً في مجتمعك</p>
              </div>
              {/* 🟢 تفعيل رابط عرض الكل ليذهب لصفحة /browse */}
              <Link className="flex items-center gap-2 text-[#006155] font-bold group" href="/browse">
                عرض الكل
                <span className="material-symbols-outlined group-hover:translate-x-[-4px] transition-transform">arrow_back</span>
              </Link>
            </div>
            
            {/* 🟢 لوجيك الداتا بيز المعدل مع الحفاظ الكامل على الديزاين */}
            {loading ? (
              <div className="flex justify-center items-center py-20 w-full">
                <div className="w-12 h-12 border-4 border-[#006155] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : itemsFromDB.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {itemsFromDB.slice(0, 4).map((item: any) => {
                  
                  // 🟢 حل مشكلة الصورة: التحقق إذا كانت رابط كامل (كلاوديناري) أو مسار محلي
                  const rawImageUrl = item.imageUrl || item.image; // الأولوية للحقل الجديد
                  const finalImgSrc = rawImageUrl
                    ? (rawImageUrl.startsWith('http') ? rawImageUrl : `${backendBaseUrl}/${rawImageUrl}`)
                    : 'https://via.placeholder.com/300?text=No+Image'; // صورة احتياطية فخمة

                  return (
                    <div key={item._id} className="group bg-white border border-[#e1e3e4] rounded-xl overflow-hidden hover:shadow-xl transition-all flex flex-col h-full">
                      <div className="relative h-56 overflow-hidden bg-gray-100">
                        {/* 🟢 استخدام رابط الصورة المعالج واستخدام item.title للـ alt */}
                        <img 
                          alt={item.title || 'صورة الغرض'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          src={finalImgSrc} 
                        />
                        <span className="absolute top-4 right-4 px-3 py-1 bg-[#006155] text-white text-xs font-bold rounded-full">
                          {item.category || 'عام'}
                        </span>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 text-[#40493d] text-sm mb-3">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          {item.location || 'عمّان'}
                        </div>
                        {/* 🟢 استخدام item.title ليتوافق مع التعديل الأخير في الداتا بيز */}
                        <h3 className="text-lg font-bold mb-6 flex-grow text-[#191c1d] line-clamp-2">{item.title}</h3>
                        <Link href={`/items/${item._id}`} className="w-full py-3 rounded-full bg-[#f3f4f5] text-[#006155] font-bold hover:bg-[#006155] hover:text-white transition-colors text-center block">
                          عرض التفاصيل
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full bg-[#f3f4f5] border-2 border-dashed border-[#bfcaba] rounded-2xl p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-[#707a6c] mb-2">inventory_2</span>
                <h3 className="text-xl font-bold text-[#40493d]">لا يوجد إضافات حالياً</h3>
                <p className="text-[#707a6c] mt-2">سيتم عرض الأغراض هنا فور إضافتها من قبل المستخدمين.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="bg-gradient-to-br from-[#006155] to-[#087c6e] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">هل لديك غرض لا تستخدمه؟</h2>
              <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto relative z-10">شارك في العطاء اليوم واجعل من فائضك وسيلة لمساعدة الآخرين. التسجيل مجاني وسريع.</p>
              
              {/* 🟢 تفعيل كبسة الـ CTA وتحويلها لـ Link يوجه لـ /add-item وبنفس الـ CSS */}
              <div className="flex flex-wrap justify-center gap-4 relative z-10">
                <Link href="/add-item" className="px-12 py-4 rounded-full bg-white text-[#006155] text-lg font-bold shadow-xl hover:scale-105 transition-all text-center inline-block">
                  ابدأ التبرع الآن
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (بدون تغيير) */}
      <footer className="w-full rounded-t-[3rem] mt-16 bg-[#003b33] flex flex-col items-center gap-8 py-12 px-6 rtl text-center text-white font-['Cairo'] text-sm leading-relaxed">
        <div className="flex flex-col items-center gap-4">
          <span className="text-3xl font-black text-white font-headline">عون</span>
          <p className="max-w-md opacity-80">منصة تهدف إلى ربط المتبرعين بالمحتاجين لتعزيز التكافل الاجتماعي في مجتمعاتنا العربية.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 font-bold">
          <Link className="text-white/80 hover:text-white transition-colors hover:underline decoration-[#7ad7c6] underline-offset-4" href="#">سياسة الخصوصية</Link>
          <Link className="text-white/80 hover:text-white transition-colors hover:underline decoration-[#7ad7c6] underline-offset-4" href="#">الشروط والأحكام</Link>
          <Link className="text-white/80 hover:text-white transition-colors hover:underline decoration-[#7ad7c6] underline-offset-4" href="#">اتصل بنا</Link>
          <Link className="text-white/80 hover:text-white transition-colors hover:underline decoration-[#7ad7c6] underline-offset-4" href="#">الأسئلة الشائعة</Link>
        </div>
        <div className="flex gap-6 mt-4">
          <Link className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all" href="#">
            <span className="material-symbols-outlined text-xl">language</span>
          </Link>
        </div>
        <div className="border-t border-white/10 pt-8 w-full max-w-4xl opacity-60 text-xs">
          © ٢٠٢٤ منصة عون المجتمعية - جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
}