"use client";

import Link from "next/link";
import Image from "next/image";
import { useHomePage, FEATURES, HIGHLIGHTS } from "./hooks/useHomePage";
import { useSiteConfig } from "@/context/SiteConfigContext";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[#e9e3da] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
      <div className="h-56 w-full animate-pulse bg-linear-to-br from-[#f4f0ea] via-[#ece7df] to-[#f8f5f0]" />
      <div className="space-y-4 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-[#ebe6de]" />
        <div className="h-4 w-full animate-pulse rounded-full bg-[#efebe4]" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#efebe4]" />
        <div className="mt-5 h-11 w-full animate-pulse rounded-2xl bg-[#f3efe8]" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { items, loading, getImageUrl } = useHomePage();
  const { platformName } = useSiteConfig();

  return (
    // ← div واحد بس، بدون <main> داخلي (الـ MainLayout يوفّره)
    <div
      dir="rtl"
      className="overflow-x-hidden bg-[#f8f6f1] text-[#211d18] antialiased"
      style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
    >
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-14 pt-8 md:pb-24 md:pt-14">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#fdfcf9_0%,#f7f4ee_55%,#f6f3ed_100%)]" />
        <div className="absolute -right-25 top-16 -z-10 h-80 w-80 rounded-full bg-[#01696f]/8 blur-3xl" />
        <div className="absolute bottom-0 -left-20 -z-10 h-72 w-72 rounded-full bg-[#005a8c]/8 blur-3xl" />

        <div className="container mx-auto px-6">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 md:mb-10 md:justify-start">
            {[
              { icon: "verified", label: "نظام ثقة واضح" },
              { icon: "bolt", label: "إشعارات فورية" },
              { icon: "favorite", label: "عطاء بكرامة" },
            ].map((badge, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-[#ddd7ce] bg-white/85 px-4 py-2 text-xs font-extrabold text-[#365155] shadow-[0_6px_18px_rgba(15,23,42,0.05)] backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-[17px] text-[#01696f]">
                  {badge.icon}
                </span>
                {badge.label}
              </div>
            ))}
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="order-2 lg:order-1">
              <h1 className="max-w-2xl text-4xl font-black leading-[1.12] text-[#173335] md:text-[3.8rem]">
                اجعل فائضك
                <span className="block bg-linear-to-l from-[#01696f] via-[#117b7f] to-[#005a8c] bg-clip-text text-transparent">
                  فرصة حياةٍ لغيرك
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#665f58] md:text-lg">
                {platformName} منصة مجتمعية لتبادل الخير بثقة؛ تساعدك على التبرع بالمواد
                والخدمات بسهولة، وتُمكّن الآخرين من الوصول لما يحتاجونه بسرعة واحترام.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/add-item"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#01696f] px-8 py-3.5 text-sm font-black text-white shadow-[0_16px_34px_rgba(1,105,111,0.24)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#0c5a5f] hover:shadow-[0_22px_46px_rgba(1,105,111,0.30)]"
                >
                  <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110">
                    volunteer_activism
                  </span>
                  ابدأ التبرع الآن
                </Link>

                <Link
                  href="/browse"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d8d1c8] bg-white px-8 py-3.5 text-sm font-bold text-[#234547] shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#01696f]/30 hover:bg-[#f6fffd] hover:shadow-[0_15px_32px_rgba(1,105,111,0.10)]"
                >
                  تصفح الاحتياجات
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:-translate-x-1">
                    arrow_back
                  </span>
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { value: "+٥٠٠٠", label: "عملية تبادل ناجحة" },
                  { value: "+١٢٠٠", label: "مستفيد على المنصة" },
                  { value: "+٣٠",   label: "مدينة ومجتمع محلي" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-[24px] border border-[#e8e2d8] bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm"
                  >
                    <p className="text-2xl font-black text-[#01696f]">{stat.value}</p>
                    <p className="mt-1 text-xs font-bold leading-6 text-[#7a746d]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-140">
                <div className="absolute inset-0 rounded-[38px] bg-linear-to-br from-[#01696f]/10 via-transparent to-[#005a8c]/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-3 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                  <div className="relative h-90 overflow-hidden rounded-[30px] md:h-135">
                    <Image
                      src="/Home.png"
                      alt={`منصة ${platformName} للتكافل الاجتماعي`}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0f1d1f]/35 via-transparent to-white/10" />
                  </div>

                  <div className="absolute right-6 top-6 rounded-[24px] border border-white/25 bg-white/20 p-4 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white">
                        <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">تنبيه فوري</p>
                        <p className="text-xs text-white/80">عند إضافة احتياج جديد</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 rounded-[26px] border border-white/25 bg-white/20 p-4 shadow-lg backdrop-blur-xl md:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#01696f] to-[#005a8c] text-white shadow-md">
                        <span className="material-symbols-outlined text-[22px]">handshake</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white md:text-base">
                          المساعدة تصل بطريقة تحفظ الكرامة
                        </p>
                        <p className="mt-1 text-xs leading-6 text-white/85 md:text-sm">
                          تجربة محسوبة لتشجع العطاء، وتقليل التعقيد، وتعزيز الثقة بين أفراد المجتمع.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-4 top-10 hidden w-44 rounded-[24px] border border-[#e9e3da] bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.08)] md:block">
                  <p className="text-xs font-extrabold text-[#8a837a]">مستوى الثقة</p>
                  <p className="mt-1 text-lg font-black text-[#183738]">موثوق ومتدرّج</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf1ef]">
                    <div className="h-full w-[82%] rounded-full bg-linear-to-l from-[#01696f] to-[#35aaa7]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust strip ────────────────────────────────────── */}
      <section className="pb-8 md:pb-12">
        <div className="container mx-auto px-6">
          <div className="rounded-[34px] border border-[#e9e3da] bg-white/85 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] backdrop-blur-sm md:p-6">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { icon: "verified_user", title: "ثقة وشفافية",     desc: "بنية واضحة تعزز مصداقية التفاعل بين أفراد المجتمع" },
                { icon: "bolt",          title: "استجابة أسرع",    desc: "الإشعارات الفورية تساعد على وصول المساعدة في الوقت المناسب" },
                { icon: "groups",        title: "مجتمع متفاعل",    desc: "كل إضافة جديدة تفتح فرصة نفع حقيقي داخل المجتمع المحلي" },
                { icon: "workspace_premium", title: "تجربة احترافية", desc: "واجهة سهلة ومريحة تشجع المستخدم على البدء دون تردد" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-[24px] bg-[#fcfbf8] p-4 transition-all duration-300 hover:bg-[#f8fffd] hover:shadow-[0_10px_24px_rgba(1,105,111,0.08)]"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f5f3] text-[#01696f]">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <h3 className="text-sm font-black text-[#193536]">{item.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[#756f68]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Partner / logo cloud ───────────────────────────── */}
      <section className="pb-14 md:pb-16">
        <div className="container mx-auto px-6">
          <div className="rounded-[30px] border border-[#ebe4db] bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
            <div className="mb-5 text-center">
              <p className="text-xs font-extrabold tracking-[0.18em] text-[#8b857d]">
                مؤشرات ثقة وشراكات مجتمعية
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {["جمعيات محلية", "متطوعون", "مبادرات شبابية", "شركاء مجتمعيون", "داعمون", "جهات موثوقة"].map((logo, i) => (
                <div
                  key={i}
                  className="flex min-h-16 items-center justify-center rounded-2xl border border-[#f0ebe4] bg-[#fcfbf8] px-4 py-3 text-center text-xs font-black text-[#6d6760] transition-all duration-300 hover:border-[#01696f]/20 hover:text-[#01696f]"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ───────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-18 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mb-14 max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-[#01696f]/10 bg-[#01696f]/6 px-4 py-2 text-xs font-extrabold tracking-wide text-[#01696f]">
              كيف تعمل عون؟
            </span>
            <h2 className="mt-5 text-3xl font-black leading-tight text-[#173335] md:text-5xl">
              خطوات واضحة،
              <span className="block text-[#01696f]">وتجربة أسهل من المتوقع</span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#746d65] md:text-base">
              من لحظة الإضافة وحتى الوصول للمحتاج المناسب، الواجهة صممت لتقليل التردد
              وجعل مسار العطاء مباشرًا وواضحًا.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative overflow-hidden rounded-[34px] bg-linear-to-bl from-[#01696f] via-[#117a7f] to-[#005a8c] p-8 text-white shadow-[0_26px_58px_rgba(1,105,111,0.20)] md:p-10">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-size-[28px_28px]" />
              <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              <div className="relative z-10">
                <span className="material-symbols-outlined mb-8 block text-5xl text-white/85">
                  volunteer_activism
                </span>
                <h3 className="text-2xl font-black leading-tight md:text-3xl">
                  ليست مجرد منصة عرض
                </h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/85 md:text-base">
                  صممنا الصفحة لتشعر المستخدم مباشرة أن المنصة موثوقة، عملية، وقريبة من الناس،
                  مع إبراز القيمة الإنسانية قبل أي شيء آخر.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {["واجهة مريحة وسلسة", "تركيز بصري على الإجراء", "إشارات ثقة واضحة", "بطاقات أسهل للمسح السريع"].map((point, i) => (
                    <div key={i} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur-sm">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="group flex gap-4 rounded-[28px] border border-[#ebe5dd] bg-[#fcfbf8] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#01696f]/20 hover:bg-white hover:shadow-[0_18px_40px_rgba(1,105,111,0.10)] md:p-6"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-linear-to-br from-[#e8f5f3] to-[#edf7fb] text-[#01696f] transition-transform duration-300 group-hover:scale-105">
                      <span className="material-symbols-outlined text-[28px]">{f.icon}</span>
                    </div>
                    {i !== FEATURES.length - 1 && (
                      <div className="mt-3 h-full w-px bg-linear-to-b from-[#01696f]/20 to-transparent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-[#1d3939]">{f.t}</h3>
                      <span className="text-xs font-black tracking-[0.2em] text-[#b4aca2]">0{i + 1}</span>
                    </div>
                    <p className="text-sm leading-7 text-[#726b63]">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {HIGHLIGHTS.map((h, i) => (
              <div
                key={i}
                className={`${h.bg} group relative overflow-hidden rounded-[30px] p-7 text-white shadow-[0_15px_35px_rgba(15,23,42,0.10)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.16)]`}
              >
                <div className="absolute inset-0 bg-linear-to-tl from-black/20 via-transparent to-white/5" />
                <span className="material-symbols-outlined absolute left-5 top-5 text-6xl opacity-15 transition-all duration-300 group-hover:scale-110">
                  {h.icon}
                </span>
                <div className="relative z-10">
                  <h4 className="text-xl font-black">{h.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-white/85">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Impact section ─────────────────────────────────── */}
      <section className="py-18 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[34px] border border-[#e9e3da] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:p-8">
              <span className="inline-flex items-center rounded-full border border-[#01696f]/10 bg-[#01696f]/6 px-4 py-2 text-xs font-extrabold tracking-wide text-[#01696f]">
                أثر المنصة
              </span>
              <h2 className="mt-5 text-3xl font-black leading-tight text-[#173335] md:text-4xl">
                عندما تصبح المساعدة
                <span className="block text-[#01696f]">أسهل… يكبر الأثر</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#746d65] md:text-base">
                هذا القسم يمنح الصفحة عمقًا أكبر من مجرد العرض، لأنه يحول المنصة من &quot;واجهة جميلة&quot;
                إلى &quot;منتج له أثر واضح ومفهوم&quot;.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "الوصول لعدد أكبر من المحتاجين في وقت أقصر",
                  "تقوية الثقة بين المستخدمين عبر نظام مستويات الثقة",
                  "تشجيع ثقافة إعادة الاستخدام بدل الهدر",
                  "إتاحة فرصة المساهمة لكل فرد مهما كان بسيطًا ما يملكه",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f5f3] text-[#01696f]">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <p className="text-sm leading-7 text-[#5f5952]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { num: "+٥٠٠٠", label: "عنصر أو خدمة تم تداولها",    color: "from-[#01696f] to-[#12777b]"  },
                { num: "+١٢٠٠", label: "مستفيد من المجتمع",            color: "from-[#005a8c] to-[#2872a1]"  },
                { num: "+٣٠",   label: "منطقة نشطة",                  color: "from-[#7a39bb] to-[#9a5ed6]"  },
                { num: "24/7",  label: "جاهزية التصفح والإشعارات",     color: "from-[#da7101] to-[#f09737]"  },
              ].map((card, i) => (
                <div
                  key={i}
                  className="rounded-[30px] border border-[#e9e3da] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="inline-flex rounded-2xl bg-linear-to-l from-[#01696f] to-[#35aaa7] px-4 py-2 text-sm font-black text-white">
                    {card.num}
                  </div>
                  <p className="mt-4 text-sm font-bold leading-7 text-[#5e5952]">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Latest donations ───────────────────────────────── */}
      <section className="bg-white py-18 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-[#01696f]/10 bg-[#01696f]/6 px-4 py-2 text-xs font-extrabold tracking-wide text-[#01696f]">
                جديد المجتمع
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight text-[#173335] md:text-5xl">
                أحدث ما أُضيف
                <span className="block text-[#01696f]">على منصة {platformName}</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#736d65] md:text-base">
                قسم واضح وسريع المسح يسهّل على المستخدم استكشاف المواد المتاحة بأقل جهد بصري.
              </p>
            </div>
            <Link
              href="/browse"
              className="group inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[#d8d1c8] bg-[#fcfbf8] px-5 py-2.5 text-sm font-black text-[#214547] shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[#01696f]/30 hover:bg-[#01696f] hover:text-white"
            >
              عرض الكل
              <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:-translate-x-1">
                arrow_back
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((item) => (
                <Link
                  key={item._id}
                  href={`/items/${item._id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-[#ebe4db] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-[#01696f]/18 hover:shadow-[0_24px_52px_rgba(1,105,111,0.12)]"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-[#f2ede5]">
                    <Image
                      src={getImageUrl(item)}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                    <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur-md">
                      {item.category || "عام"}
                    </span>
                  </div>
                  <div className="flex grow flex-col p-5">
                    <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-[#7b746c]">
                      <span className="material-symbols-outlined text-[16px] text-[#01696f]">location_on</span>
                      <span>{item.location || "عمّان"}</span>
                    </div>
                    <h3 className="grow text-base font-black leading-7 text-[#241f1a] line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#e7e1d8] bg-[#faf8f4] px-4 py-2.5 text-sm font-black text-[#01696f] transition-all duration-300 group-hover:border-[#01696f] group-hover:bg-[#01696f] group-hover:text-white">
                      عرض التفاصيل
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[34px] border-2 border-dashed border-[#d8d2ca] bg-[#fcfbf8] px-6 py-16 text-center shadow-[0_12px_34px_rgba(15,23,42,0.04)] md:px-10 md:py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#01696f]/8 text-[#01696f]">
                <span className="material-symbols-outlined text-[30px]">inventory_2</span>
              </div>
              <h3 className="mt-5 text-xl font-black text-[#1f3a3a]">لا توجد إضافات حالياً</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#7a746d]">
                ابدأ أول مساهمة على المنصة، واجعل هذه المساحة بداية لعطاء جديد يصل لمن يحتاجه.
              </p>
              <Link
                href="/add-item"
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#01696f] px-6 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(1,105,111,0.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0c5a5f]"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                أضف أول تبرع
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Testimonials ───────────────────────────────────── */}
      <section className="py-18 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[#01696f]/10 bg-[#01696f]/6 px-4 py-2 text-xs font-extrabold tracking-wide text-[#01696f]">
              أصوات من المجتمع
            </span>
            <h2 className="mt-5 text-3xl font-black text-[#173335] md:text-5xl">
              الثقة لا تُقال فقط
              <span className="block text-[#01696f]">بل تُلمس في التجربة</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#746d65] md:text-base">
              وجود شهادات وتجارب مختصرة يعزز الإحساس بأن المنصة حقيقية ومؤثرة وقريبة من الناس.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[34px] border border-[#e8e2da] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5f3] text-[#01696f]">
                  <span className="material-symbols-outlined text-[24px]">format_quote</span>
                </div>
                <div>
                  <p className="text-sm font-black text-[#173335]">تجربة مجتمعية موثوقة</p>
                  <p className="text-xs text-[#7a746d]">يمكن استبدال هذا النص لاحقًا بشهادة حقيقية</p>
                </div>
              </div>
              <p className="text-lg font-bold leading-9 text-[#2a2621]">
                &quot;الشيء الأجمل في {platformName} أن الواجهة تشعرك أن التبرع ليس عملية معقدة، بل خطوة طبيعية وسريعة،
                ومع الوقت صار من السهل علينا مشاركة ما لا نحتاجه مع من ينتفع به.&quot;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-[#01696f] to-[#005a8c] text-sm font-black text-white">
                  س
                </div>
                <div>
                  <p className="text-sm font-black text-[#173335]">سارة أحمد</p>
                  <p className="text-xs text-[#7a746d]">متبرعة على المنصة</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              {[
                { title: "من البداية حتى الاستلام",       desc: "وضوح الخطوات يجعل المستخدم أكثر استعدادًا لإكمال العملية دون تردد.",          icon: "route"    },
                { title: "إشارات ثقة في الأماكن الصحيحة", desc: "وجود مؤشرات الثقة قرب الأزرار يرفع الإحساس بالاحترافية والطمأنينة.",           icon: "shield"   },
                { title: "واجهة تشجع على العطاء",          desc: "كل قسم مصمم ليقود المستخدم بسهولة إلى الفعل الأساسي دون تشتيت.",             icon: "favorite" },
              ].map((card, i) => (
                <div
                  key={i}
                  className="rounded-[28px] border border-[#ebe4db] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(1,105,111,0.08)]"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf7f5] text-[#01696f]">
                    <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                  </div>
                  <h3 className="text-sm font-black text-[#193536]">{card.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[#756f68]">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────── */}
      <section className="bg-white py-18 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-[#01696f]/10 bg-[#01696f]/6 px-4 py-2 text-xs font-extrabold tracking-wide text-[#01696f]">
              الأسئلة الشائعة
            </span>
            <h2 className="mt-5 text-3xl font-black text-[#173335] md:text-5xl">
              كل ما قد يحتاجه المستخدم
              <span className="block text-[#01696f]">قبل أن يبدأ</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#746d65] md:text-base">
              وجود FAQ في الصفحة الرئيسية يساعد على إزالة الاعتراضات الشائعة وتقليل التردد.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-4">
            {[
              { q: "كيف أبدأ بالتبرع عبر منصة عون؟",      a: "يمكنك إضافة العنصر أو الخدمة بسهولة من خلال زر 'ابدأ التبرع الآن'، ثم تعبئة البيانات الأساسية وانتظار التفاعل من المستخدمين المهتمين." },
              { q: "هل استخدام المنصة مجاني؟",             a: "نعم، تجربة الاستخدام الأساسية على المنصة مجانية، والهدف منها تسهيل التكافل وتبادل النفع داخل المجتمع." },
              { q: "كيف يتم تعزيز الثقة بين المستخدمين؟",  a: "تعتمد المنصة على مؤشرات وثقة مجتمعية وتجربة واضحة تساعد على بناء الموثوقية وتحسين جودة التفاعل." },
              { q: "هل أستطيع تصفح الاحتياجات دون إضافة تبرع؟", a: "نعم، يمكنك استعراض الإضافات والاحتياجات مباشرة عبر صفحة التصفح، ثم اتخاذ الإجراء المناسب حسب ما يناسبك." },
            ].map((item, i) => (
              <details
                key={i}
                className="group rounded-[26px] border border-[#ebe5dd] bg-[#fcfbf8] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 open:bg-white open:shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-right">
                  <span className="text-sm font-black text-[#1a3738] md:text-base">{item.q}</span>
                  <span className="material-symbols-outlined text-[#01696f] transition-transform duration-300 group-open:rotate-45">add</span>
                </summary>
                <p className="mt-4 pr-1 text-sm leading-7 text-[#6d6760]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ──────────────────────────────────────── */}
      <section className="pb-10 pt-18 md:pb-14 md:pt-24">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-[38px] bg-linear-to-bl from-[#0d5559] via-[#01696f] to-[#005a8c] px-6 py-12 shadow-[0_34px_80px_rgba(1,105,111,0.28)] md:px-12 md:py-16">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-size-[30px_30px]" />
            <div className="absolute -left-24 top-0 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[#98f994]/10 blur-3xl" />

            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div className="text-center lg:text-right">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold tracking-wide text-white/90">
                  ابدأ بخطوة بسيطة
                </span>
                <h2 className="mt-5 text-3xl font-black leading-tight text-white md:text-5xl">
                  الشيء الذي لم يعد مهمًا لك
                  <span className="block text-white/80">قد يكون مهمًا جدًا لشخص آخر</span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 lg:mx-0 md:text-base">
                  انضم إلى مجتمع {platformName} وشارك ما لديك من أدوات أو مواد أو خدمات، ضمن تجربة
                  أنيقة وواضحة ومصممة لتشجع العطاء.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/add-item"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-black text-[#01696f] shadow-[0_16px_35px_rgba(0,0,0,0.18)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.24)]"
                >
                  <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:rotate-12">
                    volunteer_activism
                  </span>
                  ابدأ التبرع الآن
                </Link>
                <Link
                  href="/browse"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-white/40 hover:bg-white/16"
                >
                  تصفح الاحتياجات
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}