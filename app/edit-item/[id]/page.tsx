'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    condition: '',
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const backendUrl = 'http://localhost:5000';

  // 1. جلب بيانات الغرض الحالية عشان نعبي الفورم
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/items/${id}`);
        const { title, description, category, location, condition, imageUrl } = res.data;
        setFormData({ title, description, category, location, condition });
        setPreview(imageUrl.startsWith('http') ? imageUrl : `${backendUrl}/${imageUrl}`);
      } catch (err) {
        setError('فشل في جلب بيانات الغرض 🛑');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // عرض صورة معاينة فورية
    }
  };

  // 2. إرسال التعديلات للباك إند
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('location', formData.location);
    data.append('condition', formData.condition);
    if (image) data.append('image', image); // نبعت الصورة بس إذا تغيرت

    try {
      await axios.put(`${backendUrl}/api/items/update/${id}`, data, {
        headers: { 
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data' 
        }
      });
      router.push('/dashboard'); // نرجعه للداشبورد بعد النجاح
    } catch (err: any) {
      setError(err.response?.data?.msg || 'حدث خطأ أثناء التعديل');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><div className="w-10 h-10 border-4 border-[#006155] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 text-[#191c1d] font-body" dir="rtl">
      <Navbar />
      <main className="pt-24 px-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-[#edeeef]">
          <h1 className="text-2xl md:text-3xl font-black text-[#006155] mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">edit_document</span> تعديل تبرعك
          </h1>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* الصورة */}
            <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
              <img src={preview} className="w-40 h-40 object-cover rounded-xl shadow-md" alt="Preview" />
              <label className="bg-[#006155] text-white px-6 py-2 rounded-full text-xs font-bold cursor-pointer hover:bg-[#087c6e] transition-all">
                تغيير الصورة
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold mr-2 text-gray-500">اسم الغرض</label>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-[#f3f4f5] p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#006155]/20 font-bold" required />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold mr-2 text-gray-500">الوصف</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-[#f3f4f5] p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#006155]/20" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold mr-2 text-gray-500">القسم</label>
                 <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#f3f4f5] p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#006155]/20 font-bold">
                    <option value="كتب">كتب 📚</option>
                    <option value="إلكترونيات">إلكترونيات 💻</option>
                    <option value="أدوات">أدوات 🛠️</option>
                    <option value="قرطاسية">قرطاسية ✏️</option>
                    <option value="أخرى">أخرى ✨</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold mr-2 text-gray-500">الحالة</label>
                 <select name="condition" value={formData.condition} onChange={handleChange} className="w-full bg-[#f3f4f5] p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#006155]/20 font-bold">
                    <option value="جديد">جديد ✨</option>
                    <option value="مستعمل ممتاز">مستعمل ممتاز 👌</option>
                    <option value="مستعمل جيد">مستعمل جيد ✅</option>
                 </select>
               </div>
            </div>

            <button 
                type="submit" 
                disabled={updating}
                className="w-full bg-[#006155] text-white py-4 rounded-2xl font-black text-lg shadow-md hover:bg-[#087c6e] transition-all active:scale-95 disabled:opacity-50"
            >
              {updating ? 'جاري الحفظ...' : 'حفظ التعديلات 🎉'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}