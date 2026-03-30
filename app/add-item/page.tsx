'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

export default function AddItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login?redirect=/add-item');
  }, [router]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    condition: 'مستعمل ممتاز',
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert("حجم الصورة كبير جداً، الحد الأقصى 5 ميجا");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }
};

  const handleSubmit = async (e: FormEvent) => {
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
    data.append('image', image);

    try {
      await axios.post('http://localhost:5000/api/items', data, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ type: 'success', text: 'تم نشر التبرع بنجاح! جاري تحويلك...' });
      setTimeout(() => router.push('/browse'), 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage({ type: 'error', text: err.response?.data?.msg || 'فشل في إضافة التبرع' });
      } else {
        setMessage({ type: 'error', text: 'حدث خطأ غير متوقع' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen pb-20 md:pb-32 text-[#191c1d]" dir="rtl">
      <Navbar />

      <main className="pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto font-body">
        <div className="mb-6 md:mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold font-headline mb-2">إضافة تبرع جديد</h1>
          <p className="text-sm md:text-base text-on-surface-variant">شارك الخير مع مجتمعك واجعل أثرك يمتد 🎁</p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_60px_rgba(0,97,85,0.08)] p-6 md:p-10 border border-[#edeeef]">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            
            <div className="relative group">
              <label className="block mb-2 font-bold text-xs md:text-sm">صور الغرض</label>
              <div className={`border-2 border-dashed rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${preview ? 'border-primary bg-emerald-50' : 'border-outline-variant bg-surface-container-low hover:bg-[#edeeef]'}`}>
                {preview ? (
                  <div className="relative w-full h-40 md:h-48">
                    <Image src={preview} alt="Preview" fill className="object-contain rounded-xl" />
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl md:text-5xl text-primary/60 mb-3 md:mb-4">cloud_upload</span>
                    <p className="font-medium text-sm md:text-base mb-1">اسحب الصورة هنا أو اضغط للرفع</p>
                    <p className="text-on-surface-variant text-[10px] md:text-xs italic">يدعم JPG, PNG (حد أقصى 5MB)</p>
                  </>
                )}
                <input required type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:gap-6">
              <div className="space-y-2">
                <label className="block font-bold text-xs md:text-sm mr-1">اسم الغرض</label>
                <input 
                  required name="title" value={formData.title} onChange={handleChange}
                  className="w-full bg-surface-container-low text-sm md:text-base border-none rounded-xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-outline" 
                  placeholder="مثال: لابتوب ديل مستعمل" type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <label className="block font-bold text-xs md:text-sm mr-1">التصنيف</label>
                  <div className="relative">
                    <select required name="category" value={formData.category} onChange={handleChange} className="w-full appearance-none bg-surface-container-low text-sm md:text-base border-none rounded-xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none">
                      <option value="" disabled>اختر التصنيف</option>
                      <option>إلكترونيات</option><option>كتب</option><option>أثاث</option><option>ملابس</option><option>أخرى</option>
                    </select>
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-bold text-xs md:text-sm mr-1">المدينة</label>
                  <div className="relative">
                    <select required name="location" value={formData.location} onChange={handleChange} className="w-full appearance-none bg-surface-container-low text-sm md:text-base border-none rounded-xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none">
                      <option value="" disabled>اختر المدينة</option>
                      <option>عمان</option><option>إربد</option><option>الزرقاء</option><option>العقبة</option>
                    </select>
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">location_on</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-xs md:text-sm mr-1">حالة الغرض</label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {['جديد', 'مستعمل ممتاز', 'مستعمل جيد'].map((cond) => (
                    <label key={cond} className="flex-1 min-w-25 cursor-pointer group">
                      <input 
                        type="radio" name="condition" value={cond} checked={formData.condition === cond}
                        onChange={handleChange} className="hidden peer"
                      />
                      <div className="bg-surface-container-low peer-checked:bg-[#98f994] peer-checked:text-[#002204] text-on-surface-variant px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-center transition-all text-xs md:text-sm font-medium hover:bg-surface-container-highest">
                        {cond}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-xs md:text-sm mr-1">الوصف التفصيلي</label>
                <textarea 
                  required name="description" value={formData.description} onChange={handleChange}
                  className="w-full bg-surface-container-low text-sm md:text-base border-none rounded-xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-outline resize-none" 
                  placeholder="اكتب تفاصيل إضافية عن القطعة..." rows={4}
                ></textarea>
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-xl text-center text-sm md:text-base font-bold ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div className="flex flex-col sm:flex-row-reverse gap-3 md:gap-4 pt-2 md:pt-4">
              <button 
                disabled={loading} type="submit"
                className="flex-1 bg-linear-to-br from-primary to-primary-container text-white text-sm md:text-base font-bold py-3 md:py-4 px-6 md:px-8 rounded-full shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'جاري النشر...' : 'انشر التبرع الآن'}</span>
                <span className="material-symbols-outlined text-lg md:text-xl">send</span>
              </button>
              <button 
                type="button" onClick={() => router.back()}
                className="flex-1 bg-surface-container-low text-on-surface-variant text-sm md:text-base font-bold py-3 md:py-4 px-6 md:px-8 rounded-full hover:bg-surface-container-highest transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}