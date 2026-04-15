"use client";

import Link  from "next/link";
import Image from "next/image";
import { useHomePage, FEATURES, HIGHLIGHTS } from "./hooks/useHomePage";

export default function HomePage() {
  const { items, loading, getImageUrl } = useHomePage();

  return (
    <div className="bg-surface text-[#191c1d] antialiased overflow-x-hidden font-body" dir="rtl">
      <main className="mt-16 md:mt-20">

        {/* ─── 1. Hero ─── */}
        <section className="relative min-h-150 md:min-h-175 flex items-center pt-8 md:pt-12 pb-16 md:pb-20 overflow-hidden">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

            <div className="z-10 order-2 md:order-1 text-center md:text-right">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#98f994]/30 text-[#0c7521] text-xs font-bold mb-6">
                منصة مجتمعية موثوقة
              </span>
              <h1 className="text-4xl md:text-5xl font-black font-headline leading-tight text-primary mb-6">
                فائضك..
                <br />
                <span className="text-secondary">عونٌ لغيرك</span>
              </h1>
              <p className="text-base md:text-lg text-on-surface-variant leading-relaxed mb-10 max-w-lg mx-auto md:mx-0">
                منصة مجتمعية قائمة على الثقة، تهدف لتسهيل عملية التبرع واستلام المواد الأساسية مجاناً وبكل كرامة.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Link href="/add-item" className="px-10 py-4 rounded-full bg-linear-to-br from-primary to-primary-container text-white text-base md:text-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  تبرع الآن
                </Link>
                <Link href="/browse" className="px-10 py-4 rounded-full bg-surface-container-highest text-[#005047] text-base md:text-lg font-bold hover:bg-[#d9dadb] transition-all">
                  تصفح الاحتياجات
                </Link>
              </div>
            </div>

            <div className="relative order-1 md:order-2">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#005a8c]/10 rounded-full blur-3xl" />
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl transform rotate-2 max-w-sm md:max-w-md mx-auto md:mx-0">
                <div className="relative w-full h-87.5 md:h-112.5">
                  <Image
                    src="/Home.png" alt="Home Hero" fill priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl flex items-center gap-4 border border-white/20 bg-white/30 backdrop-blur-md">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary-container flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">أكثر من +٥,٠٠٠</p>
                    <p className="text-xs text-on-surface-variant font-bold">عملية تبادل تمت بنجاح</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. Features ─── */}
        <section id="how-it-works" className="py-16 md:py-20 bg-surface-container-low">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-black font-headline text-primary mb-4">
                كيف تعمل منصة عون؟
              </h2>
              <div className="w-20 h-1.5 bg-linear-to-br from-primary to-primary-container mx-auto rounded-full" />
            </div>

            {/* خطوات العمل */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-20">
              {FEATURES.map((f, i) => (
                <div key={i} className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl md:text-4xl">{f.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.t}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>

            {/* بطاقات المميزات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HIGHLIGHTS.map((h, i) => (
                <div key={i} className={`${h.bg} text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-end min-h-50 md:min-h-55 shadow-lg`}>
                  <span className="material-symbols-outlined absolute top-6 right-6 text-6xl opacity-20">{h.icon}</span>
                  <h4 className="text-2xl font-bold mb-2">{h.title}</h4>
                  <p className="text-sm text-white/80">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 3. Latest Donations ─── */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-black font-headline text-primary mb-2">أحدث الإضافات</h2>
                <p className="text-on-surface-variant">اكتشف ما تمت إضافته حديثاً في مجتمعك</p>
              </div>
              <Link href="/browse" className="flex items-center gap-2 text-primary font-bold group text-sm md:text-base">
                عرض الكل
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20 w-full">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {items.map((item) => (
                  <Link
                    key={item._id} href={`/items/${item._id}`}
                    className="group bg-white border border-surface-container-highest rounded-xl overflow-hidden hover:shadow-xl transition-all flex flex-col h-full"
                  >
                    <div className="relative w-full h-80 overflow-hidden rounded-2xl">
                      <Image
                        src={getImageUrl(item)} alt={item.title} fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover"
                      />
                      <span className="absolute top-4 right-4 px-3 py-1 bg-primary/90 text-white text-xs font-bold rounded-full">
                        {item.category || "عام"}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col grow">
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-3">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        {item.location || "عمّان"}
                      </div>
                      <h3 className="text-lg font-bold mb-6 grow text-[#191c1d] line-clamp-2">{item.title}</h3>
                      <div className="w-full py-3 rounded-full bg-surface-container-low text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all text-center">
                        عرض التفاصيل
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="w-full bg-surface-container-low border-2 border-dashed border-outline-variant rounded-2xl p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">inventory_2</span>
                <h3 className="text-xl font-bold text-on-surface-variant">لا يوجد إضافات حالياً</h3>
              </div>
            )}
          </div>
        </section>

        {/* ─── 4. CTA ─── */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="bg-linear-to-br from-primary to-primary-container rounded-[2.5rem] md:rounded-[3rem] p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
              />
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">
                هل لديك غرض لا تستخدمه؟
              </h2>
              <p className="text-white/90 text-sm md:text-lg mb-10 max-w-2xl mx-auto relative z-10">
                شارك في العطاء اليوم واجعل من فائضك وسيلة لمساعدة الآخرين. التسجيل مجاني وسريع.
              </p>
              <Link href="/add-item" className="inline-block px-12 py-4 rounded-full bg-white text-primary text-lg font-bold shadow-xl hover:scale-105 transition-all relative z-10">
                ابدأ التبرع الآن
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}