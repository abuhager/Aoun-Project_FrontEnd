"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link"; 

export default function DashboardPage() {
  const [data, setData] = useState({ myDonations: [], myRequests: [], user: null });
  const [activeTab, setActiveTab] = useState("donations");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const backendBaseUrl = "http://localhost:5000";

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");
      const res = await axios.get(`${backendBaseUrl}/api/items/me`, {
        headers: { "x-auth-token": token },
      });
      setData(res.data);
    } catch (err) {
      console.error("خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التبرع؟")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendBaseUrl}/api/items/delete/${id}`, {
        headers: { "x-auth-token": token },
      });
      fetchData();
    } catch (err) { alert("حدث خطأ أثناء الحذف"); }
  };

  const handleConfirmDelivery = async (e: any) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendBaseUrl}/api/items/complete/${selectedItem._id}`, { otp }, {
        headers: { "x-auth-token": token }
      });
      setShowModal(false);
      setOtp("");
      fetchData();
    } catch (err: any) {
      setOtpError(err.response?.data?.msg || "الرمز غير صحيح ❌");
    } finally { setOtpLoading(false); }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-[#f8f9fa]"><div className="w-10 h-10 border-4 border-[#006155] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-16 md:pb-20 text-[#191c1d] font-body" dir="rtl">
      <Navbar />
      <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* Profile Card */}
        <section className="bg-white rounded-2xl p-6 md:p-8 text-center flex flex-col items-center gap-3 shadow-sm border border-[#edeeef] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#006155]/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-[#006155]/10 z-10">
            <span className="material-symbols-outlined text-4xl md:text-5xl text-[#006155]">account_circle</span>
          </div>
          <div className="z-10">
            <h1 className="text-xl md:text-2xl font-black">{data.user?.name || "مستخدم عون"}</h1>
            <p className="text-xs md:text-sm text-[#40493d] mt-1">{data.user?.email}</p>
          </div>
          {data.user?.email?.includes('.edu') ? (
            <div className="flex items-center gap-1.5 bg-[#006e1c]/10 px-3 py-1 rounded-full border border-[#006e1c]/20 z-10">
              <span className="material-symbols-outlined text-[#006e1c] text-sm">school</span>
              <span className="text-[#006e1c] font-bold text-[10px] md:text-xs">طالب موثق</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 z-10">
              <span className="material-symbols-outlined text-[#40493d] text-sm">person</span>
              <span className="text-[#40493d] font-bold text-[10px] md:text-xs">مستخدم عادي</span>
            </div>
          )}
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#edeeef] text-center">
            <span className="text-[#40493d] font-bold text-xs block mb-3">نقاط الثقة</span>
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-[#e7e8e9]" cx="40" cy="40" r="36" fill="transparent" strokeWidth="6"></circle>
                <circle className="text-[#006155]" cx="40" cy="40" r="36" fill="transparent" strokeWidth="6" strokeDasharray="226" strokeDashoffset={226 - (226 * (data.user?.trustScore || 85)) / 100}></circle>
              </svg>
              <span className="absolute text-xl font-black">{data.user?.trustScore || 85}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#edeeef] flex flex-col justify-center text-center gap-3">
            <span className="text-[#40493d] font-bold text-xs">الكوتا المتبقية</span>
            <div className="h-1.5 w-full bg-[#e7e8e9] rounded-full overflow-hidden">
              <div className="h-full bg-[#005a8c] w-3/5 rounded-full"></div>
            </div>
            <div className="bg-[#cee5ff] text-[#004a75] px-3 py-1 rounded-lg text-[10px] font-bold">ضايل لك 3 طلبات هذا الأسبوع</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#edeeef] flex flex-col items-center justify-center gap-2">
            <span className="text-[#40493d] font-bold text-xs">إجمالي العطاء</span>
            <span className="text-4xl md:text-5xl font-black text-[#006155]">{data.myDonations.length}</span>
            <div className="flex items-center gap-1 text-[#006e1c]"><span className="material-symbols-outlined text-xs">favorite</span><span className="text-[10px] font-bold">أثرك ممتد</span></div>
          </div>
        </section>

        {/* Tabs and Table */}
        <section className="space-y-4">
          <div className="flex border-b border-[#edeeef] gap-4 overflow-x-auto">
            <button onClick={() => setActiveTab("donations")} className={`px-4 py-3 font-bold text-sm transition-all ${activeTab === "donations" ? "text-[#006155] border-b-2 border-[#006155]" : "text-[#40493d]"}`}>تبرعاتي</button>
            <button onClick={() => setActiveTab("requests")} className={`px-4 py-3 font-bold text-sm transition-all ${activeTab === "requests" ? "text-[#006155] border-b-2 border-[#006155]" : "text-[#40493d]"}`}>طلباتي</button>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#edeeef]">
            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-[650px] text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#f3f4f5] text-[#40493d] font-bold"><th className="px-4 py-3">اسم الغرض</th><th className="px-4 py-3">الصورة</th><th className="px-4 py-3">التاريخ</th><th className="px-4 py-3 text-center">الحالة</th><th className="px-4 py-3 text-center">الإجراءات</th></tr>
                </thead>
                <tbody className="divide-y divide-[#edeeef]">
                  {(activeTab === "donations" ? data.myDonations : data.myRequests).map((item: any) => (
                    <tr key={item._id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-4 py-3 font-bold">{item.title}</td>
                      <td className="px-4 py-3"><img className="w-10 h-10 rounded-lg object-cover" src={item.imageUrl ? (item.imageUrl.startsWith("http") ? item.imageUrl : `${backendBaseUrl}/${item.imageUrl}`) : "https://via.placeholder.com/100"} /></td>
                      <td className="px-4 py-3 text-[#40493d]">{new Date(item.createdAt).toLocaleDateString("ar-EG")}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === "تم التسليم" ? "bg-green-100 text-green-700" : item.status === "محجوز" ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"}`}>{item.status}</span>
                          
                          {(item.status === "محجوز" || item.status === "تم التسليم") && (
                             <Link href={`/profile/${activeTab === 'donations' ? item.bookedBy?._id : item.donor?._id}`} className="text-[9px] text-blue-600 hover:underline font-bold flex items-center gap-0.5">
                               <span className="material-symbols-outlined text-[12px]">person</span> {activeTab === 'donations' ? `المستلم: ${item.bookedBy?.name.split(' ')[0]}` : `المتبرع: ${item.donor?.name.split(' ')[0]}`}
                             </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => router.push(`/items/${item._id}`)} className="text-[#006155] hover:underline font-bold text-xs">التفاصيل</button>
                          
                          {activeTab === "donations" && item.status === "متاح" && (
                            <>
                              <button onClick={() => router.push(`/edit-item/${item._id}`)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg" title="تعديل"><span className="material-symbols-outlined text-sm">edit</span></button>
                              <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg" title="حذف"><span className="material-symbols-outlined text-sm">delete</span></button>
                            </>
                          )}

                          {activeTab === "requests" && item.deliveryOtp && (
                            <div className="bg-blue-50 text-blue-700 font-black px-2 py-1 rounded text-xs">{item.deliveryOtp}</div>
                          )}

                          {activeTab === "donations" && item.status === "محجوز" && (
                            <button onClick={() => { setSelectedItem(item); setShowModal(true); }} className="bg-[#006155] text-white px-3 py-1 rounded-lg text-[10px] font-bold">تأكيد التسليم</button>
                          )}

                          {/* 🟢 زر الواتساب المحدث: يظهر في حالة محجوز وَ تم التسليم */}
                          {(item.status === "محجوز" || item.status === "تم التسليم") && (
                        <a 
  href={`https://wa.me/${(activeTab === "requests" ? item.donor?.phone : item.bookedBy?.phone)?.replace(/\D/g, '')}`} 
  target="_blank" 
  className="bg-[#25D366] text-white p-1.5 rounded-lg"
>
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.124.553 4.195 1.604 6.015L.234 23.4l5.495-1.44a11.96 11.96 0 0 0 6.302 1.763c6.648 0 12.031-5.383 12.031-12.031S18.679 0 12.031 0zm3.84 17.387c-.165.465-.96 1.05-1.503 1.155-.544.105-1.042.23-3.21-.67-2.613-1.085-4.282-3.765-4.412-3.938-.13-.173-1.054-1.405-1.054-2.68 0-1.275.66-1.905.897-2.16.237-.255.513-.319.682-.319.17 0 .341.005.49.012.16.007.375-.062.571.393.195.455.665 1.62.723 1.745.058.125.097.27.019.43-.078.16-.117.26-.237.41-.12.15-.25.32-.355.45-.115.14-.24.29-.105.504.135.215.6 1.005 1.3 1.635.905.815 1.69 1.07 1.91 1.19.22.12.35.095.48-.07.13-.165.56-.655.71-.88.15-.225.3-.187.5-.112.2.075 1.26.595 1.475.705.215.11.355.165.405.255.05.09.05.52-.115.985z" />
  </svg>
</a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Modal - تأكيد التسليم */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-lg font-bold mb-2">تأكيد التسليم</h3>
            <p className="text-[#40493d] text-xs mb-5">أدخل رمز الـ OTP الخاص بـ <span className="font-bold">{selectedItem.title}</span></p>
            {otpError && <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs mb-4">{otpError}</div>}
            <form onSubmit={handleConfirmDelivery}>
              <input type="text" maxLength={4} className="w-full bg-[#f3f4f5] text-center text-2xl font-black py-3 rounded-xl mb-5 outline-none" placeholder="••••" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              <div className="flex gap-2">
                <button type="submit" disabled={otpLoading || otp.length !== 4} className="flex-1 bg-[#006155] text-white text-sm font-bold py-3 rounded-full">{otpLoading ? "جاري التأكيد..." : "تأكيد"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-[#f3f4f5] text-[#40493d] text-sm font-bold py-3 rounded-full">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}