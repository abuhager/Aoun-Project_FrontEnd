"use client";

import Link   from "next/link";
import Image  from "next/image";
import Navbar from "@/components/Navbar";
import { usePublicProfile } from "./hooks/usePublicProfile";

export default function PublicProfilePage() {
  const {
    profileData, activeTab, setActiveTab,
    loading, activeItems, trustScore,
    getImageUrl, renderStars,
  } = usePublicProfile();

  // ─── شاشة التحميل ───
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ─── حساب غير موجود ───
  if (!profileData) return (
    <div className="text-center py-20 bg-surface min-h-screen">
      <div className="mt-32 font-bold text-red-600">🛑 هذا الحساب غير موجود</div>
    </div>
  );

  const { user, stats } = profileData;

  return (
    <div className="bg-surface min-h-screen text-[#191c1d] font-body pb-20" dir="rtl">

      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-5xl mx-auto">

        {/* ─── هيدر البروفايل ─── */}
        <section className="relative mb-20">
          <div className="h-40 md:h-56 w-full rounded-3xl bg-linear-to-br from-primary via-primary-container to-[#96f7e9] shadow-md relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/5 rounded-full blur-2xl" />
          </div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-surface bg-white overflow-hidden shadow-xl flex items-center justify-center ring-4 ring-primary/5 relative">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
              ) : (
                <span className="material-symbols-outlined text-6xl md:text-7xl text-primary">
                  account_circle
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ─── معلومات المستخدم ─── */}
        <section className="text-center mb-8 mt-4">
          <h1 className="text-2xl md:text-3xl font-black flex items-center justify-center gap-2">
            {user.name}
            {user.isVerifiedStudent && (
              <span className="material-symbols-outlined text-secondary text-xl" title="طالب جامعي">
                school
              </span>
            )}
          </h1>

          {/* شارة العضو الموثوق */}
          {trustScore >= 90 && (
            <div className="flex justify-center mt-2 mb-1">
              <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-blue-100 shadow-sm">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                عضو موثوق
              </span>
            </div>
          )}

          {/* النجوم */}
          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="flex gap-0.5">
              {renderStars(trustScore).map(({ key, filled }) => (
                <span
                  key={key}
                  className={`material-symbols-outlined text-[16px] ${filled ? "text-yellow-400" : "text-gray-200"}`}
                  style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
                >
                  star
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="text-yellow-600">{(trustScore / 20).toFixed(1)} / 5</span>
              <span className="text-gray-400 font-normal">({stats.totalRatings} تقييم)</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 mt-2 italic">
            انضم لعون في {new Date(user.createdAt).getFullYear()}
          </p>

          {/* زر واتساب */}
          <div className="mt-5 flex justify-center">
            <a
              href={`https://wa.me/${user.phone?.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-8 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-[#20ba5a] transition-all shadow-lg active:scale-95"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.124.553 4.195 1.604 6.015L.234 23.4l5.495-1.44a11.96 11.96 0 0 0 6.302 1.763c6.648 0 12.031-5.383 12.031-12.031S18.679 0 12.031 0zm3.84 17.387c-.165.465-.96 1.05-1.503 1.155-.544.105-1.042.23-3.21-.67-2.613-1.085-4.282-3.765-4.412-3.938-.13-.173-1.054-1.405-1.054-2.68 0-1.275.66-1.905.897-2.16.237-.255.513-.319.682-.319.17 0 .341.005.49.012.16.007.375-.062.571.393.195.455.665 1.62.723 1.745.058.125.097.27.019.43-.078.16-.117.26-.237.41-.12.15-.25.32-.355.45-.115.14-.24.29-.105.504.135.215.6 1.005 1.3 1.635.905.815 1.69 1.07 1.91 1.19.22.12.35.095.48-.07.13-.165.56-.655.71-.88.15-.225.3-.187.5-.112.2.075 1.26.595 1.475.705.215.11.355.165.405.255.05.09.05.52-.115.985z"/>
              </svg>
              تواصل عبر واتساب
            </a>
          </div>
        </section>

        {/* ─── Stats Bento Grid ─── */}
        <section className="grid grid-cols-3 gap-3 md:gap-6 mb-12">
          {[
            { value: trustScore,           label: "نقاط الثقة",     color: "text-primary" },
            { value: stats.donationsCount, label: "إجمالي العطاء",  color: "text-primary" },
            { value: stats.receivedCount,  label: "أغراض مستلمة",  color: "text-[#005a8c]" },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
              <span className={`text-2xl md:text-3xl font-black ${color}`}>{value}</span>
              <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </section>

        {/* ─── سجل النشاط ─── */}
        <section className="space-y-6">
          <div className="flex border-b border-gray-200 gap-8">
            {(["donations", "requests"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-black text-sm transition-all relative ${
                  activeTab === tab ? "text-primary" : "text-gray-400"
                }`}
              >
                {tab === "donations" ? "سجل التبرعات" : "أغراض استلمها"}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* ─── الكروت ─── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {activeItems.map((item) => (
              <Link
                key={item._id}
                href={`/items/${item._id}`}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group hover:shadow-md transition-all"
              >
                <div className="relative h-40 overflow-hidden bg-gray-50">
                  <Image
                    src={getImageUrl(item.imageUrl)}
                    alt={item.title}
                    fill
                    className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
                      item.status === "تم التسليم" ? "grayscale-[0.5] opacity-80" : ""
                    }`}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black text-white backdrop-blur-md ${
                      item.status === "تم التسليم" ? "bg-gray-500/80" :
                      item.status === "محجوز"      ? "bg-[#005a8c]/80" : "bg-primary/80"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold truncate mb-1 text-[#191c1d]">{item.title}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ─── Empty State ─── */}
          {activeItems.length === 0 && (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inventory_2</span>
              <p className="text-gray-400 text-sm font-bold">لا يوجد سجلات لعرضها حالياً.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}