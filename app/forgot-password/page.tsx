'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('https://aoun-project-backend.onrender.com/api/auth/forgot-password', { email });
      setMessage(res.data.msg);
    } catch (err: unknown) { // 🟢 تغيير any إلى unknown
      // 🟢 التحقق من نوع الخطأ بشكل آمن
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.');
      } else {
        setError('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-body" dir="rtl">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-sm border border-[#edeeef] text-center">
        
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl text-primary">mark_email_read</span>
        </div>

        <h1 className="text-2xl font-black text-[#191c1d] mb-2 font-headline">نسيت كلمة المرور؟</h1>
        <p className="text-sm text-on-surface-variant mb-8">
          أدخل بريدك الإلكتروني المسجل لدينا، وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
        </p>

        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold mb-6 border border-green-100">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-right">
            <label className="text-xs font-bold text-gray-500 mr-2 block mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">mail</span>
              <input
                type="email"
                required
                className="w-full pr-12 pl-4 py-4 bg-surface-container-highest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-bold"
                placeholder="example@student.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-md shadow-primary/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">send</span>
                إرسال الرابط
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-sm text-on-surface-variant font-bold">
          تذكرت كلمة المرور؟{' '}
          <Link href="/login" className="text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}