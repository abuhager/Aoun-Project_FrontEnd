'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AddItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // 1. حارس البوابة: تأكد من تسجيل الدخول
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login?redirect=/add-item');
  }, [router]);

  // 2. الـ State للبيانات
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    condition: 'مستعمل ممتاز',
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // عرض معاينة للصورة
    }
  };

  // 3. لوجيك الإرسال
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!image) return setMessage({ type: 'error', text: 'الرجاء اختيار صورة للقطعة' });
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('location', formData.location);
    data.append('condition', formData.condition);
    data.append('image', image); // لازم يطابق الباك إند: upload.single('image')

    try {
      await axios.post('http://localhost:5000/api/items', data, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ type: 'success', text: 'تم نشر التبرع بنجاح! جاري تحويلك...' });
      setTimeout(() => router.push('/browse'), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'فشل في إضافة التبرع' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 md:pb-32 text-[#191c1d]" dir="rtl">
      <Navbar />

      <main className="pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto font-body">
        {/* العناوين */}
        <div className="mb-6 md:mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold font-headline mb-2">إضافة تبرع جديد</h1>
          <p className="text-sm md:text-base text-[#40493d]">شارك الخير مع مجتمعك واجعل أثرك يمتد 🎁</p>
        </div>

        {/* الحاوية البيضاء الفخمة */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_60px_rgba(0,97,85,0.08)] p-6 md:p-10 border border-[#edeeef]">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            
            {/* منطقة رفع الصور */}
            <div className="relative group">
              <label className="block mb-2 font-bold text-xs md:text-sm">صور الغرض</label>
              <div className={`border-2 border-dashed rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${preview ? 'border-[#006155] bg-emerald-50' : 'border-[#bfcaba] bg-[#f3f4f5] hover:bg-[#edeeef]'}`}>
                {preview ? (
                  <img src={preview} className="w-full h-40 md:h-48 object-contain rounded-xl" alt="Preview" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl md:text-5xl text-[#006155]/60 mb-3 md:mb-4">cloud_upload</span>
                    <p className="font-medium text-sm md:text-base mb-1">اسحب الصورة هنا أو اضغط للرفع</p>
                    <p className="text-[#40493d] text-[10px] md:text-xs italic">يدعم JPG, PNG (حد أقصى 5MB)</p>
                  </>
                )}
                <input required type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:gap-6">
              {/* اسم الغرض */}
              <div className="space-y-2">
                <label className="block font-bold text-xs md:text-sm mr-1">اسم الغرض</label>
                <input 
                  required name="title" value={formData.title} onChange={handleChange}
                  className="w-full bg-[#f3f4f5] text-sm md:text-base border-none rounded-xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-[#006155]/20 focus:bg-white transition-all placeholder:text-[#707a6c]" 
                  placeholder="مثال: لابتوب ديل مستعمل" type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                {/* التصنيف */}
                <div className="space-y-2">
                  <label className="block font-bold text-xs md:text-sm mr-1">التصنيف</label>
                  <div className="relative">
                    <select required name="category" value={formData.category} onChange={handleChange} className="w-full appearance-none bg-[#f3f4f5] text-sm md:text-base border-none rounded-xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-[#006155]/20 focus:bg-white transition-all outline-none">
                      <option value="" disabled>اختر التصنيف</option>
                      <option>إلكترونيات</option><option>كتب</option><option>أثاث</option><option>ملابس</option><option>أخرى</option>
                    </select>
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#707a6c]">expand_more</span>
                  </div>
                </div>
                {/* المدينة */}
                <div className="space-y-2">
                  <label className="block font-bold text-xs md:text-sm mr-1">المدينة</label>
                  <div className="relative">
                    <select required name="location" value={formData.location} onChange={handleChange} className="w-full appearance-none bg-[#f3f4f5] text-sm md:text-base border-none rounded-xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-[#006155]/20 focus:bg-white transition-all outline-none">
                      <option value="" disabled>اختر المدينة</option>
                      <option>عمان</option><option>إربد</option><option>الزرقاء</option><option>العقبة</option>
                    </select>
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#707a6c]">location_on</span>
                  </div>
                </div>
              </div>

              {/* الحالة */}
              <div className="space-y-2">
                <label className="block font-bold text-xs md:text-sm mr-1">حالة الغرض</label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {['جديد', 'مستعمل ممتاز', 'مستعمل جيد'].map((cond) => (
                    <label key={cond} className="flex-1 min-w-[100px] cursor-pointer group">
                      <input 
                        type="radio" name="condition" value={cond} checked={formData.condition === cond}
                        onChange={handleChange} className="hidden peer"
                      />
                      <div className="bg-[#f3f4f5] peer-checked:bg-[#98f994] peer-checked:text-[#002204] text-[#40493d] px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-center transition-all text-xs md:text-sm font-medium hover:bg-[#e1e3e4]">
                        {cond}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* الوصف */}
              <div className="space-y-2">
                <label className="block font-bold text-xs md:text-sm mr-1">الوصف التفصيلي</label>
                <textarea 
                  required name="description" value={formData.description} onChange={handleChange}
                  className="w-full bg-[#f3f4f5] text-sm md:text-base border-none rounded-xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-[#006155]/20 focus:bg-white transition-all placeholder:text-[#707a6c] resize-none" 
                  placeholder="اكتب تفاصيل إضافية عن القطعة..." rows={4}
                ></textarea>
              </div>
            </div>

            {/* رسائل التنبيه */}
            {message.text && (
              <div className={`p-4 rounded-xl text-center text-sm md:text-base font-bold ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}

            {/* الأزرار */}
            <div className="flex flex-col sm:flex-row-reverse gap-3 md:gap-4 pt-2 md:pt-4">
              <button 
                disabled={loading} type="submit"
                className="flex-1 bg-gradient-to-br from-[#006155] to-[#087c6e] text-white text-sm md:text-base font-bold py-3 md:py-4 px-6 md:px-8 rounded-full shadow-lg hover:shadow-[#006155]/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'جاري النشر...' : 'انشر التبرع الآن'}</span>
                <span className="material-symbols-outlined text-lg md:text-xl">send</span>
              </button>
              <button 
                type="button" onClick={() => router.back()}
                className="flex-1 bg-[#f3f4f5] text-[#40493d] text-sm md:text-base font-bold py-3 md:py-4 px-6 md:px-8 rounded-full hover:bg-[#e1e3e4] transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>

        {/* ملاحظة الأمان */}
        <div className="mt-6 md:mt-8 bg-[#cee5ff]/20 p-4 md:p-6 rounded-2xl border border-[#cee5ff] flex items-start gap-3 md:gap-4 text-[#005a8c]">
          <span className="material-symbols-outlined mt-0.5 md:mt-0">info</span>
          <div>
            <p className="text-xs md:text-sm font-bold mb-1">ملاحظة أمان</p>
            <p className="text-[10px] md:text-xs leading-relaxed">يرجى التأكد من نظافة الغرض وجودته قبل تسليمه. مساعدتك تصنع فرقاً حقيقياً.</p>
          </div>
        </div>
      </main>
    </div>
  );
}