"use client";
import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

// 1. غيرنا اسم الـ Function الأصلي وفصلناه عشان نغلفه تحت
function VerifyContent() {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // تعريف نوع الـ ref عشان TypeScript ما يزعل
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // بنسحب الإيميل من الرابط عشان نبعته للباك إند
    const email = searchParams.get('email'); 

    // دالة للتعامل مع كتابة الأرقام وانتقال الماوس التلقائي
    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return; // بنسمح بس بالأرقام

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1); // بناخذ آخر رقم انكتب بس
        setOtp(newOtp);

        // إذا كتب رقم، انقل الماوس للمربع اللي بعده
        if (value && index < 3 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // دالة للتعامل مع زر المسح (Backspace) عشان يرجع الماوس لورا
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // دالة إرسال الكود للباك إند
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join('');
        
        if (otpCode.length !== 4) {
            setError('الرجاء إدخال الرمز المكون من 4 أرقام 🛑');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            // نبعت الريكويست للباك إند
            const res = await axios.post('https://aoun-project-backend.onrender.com/api/auth/verify-email', {
                email,
                otp: otpCode
            });

            // إذا نجح التحقق، بنوديه لصفحة تسجيل الدخول مع رسالة نجاح
            router.push('/login?verified=true');
            
        } catch (err: any) {
            setError(err.response?.data?.msg || 'حدث خطأ أثناء التحقق من الرمز ❌');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 direction-rtl font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">تحقق من بريدك الإلكتروني ✉️</h2>
                    <p className="text-gray-500 text-sm">
                        أدخل الرمز المكون من 4 أرقام الذي أرسلناه إلى:
                        <br/>
                        <span className="font-semibold text-teal-600" dir="ltr">{email}</span>
                    </p>
                </div>

                {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center gap-3 mb-8" dir="ltr">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-14 h-14 text-center text-2xl font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:bg-teal-300 flex justify-center items-center"
                    >
                        {loading ? 'جاري التحقق...' : 'تأكيد الحساب'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// 2. هذا هو الـ Component الرئيسي اللي بصدره Next.js
export default function VerifyEmailPage() {
    return (
        // تم تغليف المحتوى بـ Suspense وحل المشكلة
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
                <div className="text-xl font-bold text-teal-600 animate-pulse">جاري التحميل... ⏳</div>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}