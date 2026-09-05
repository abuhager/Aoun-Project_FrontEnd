import Link from "next/link";

interface RegisterFeedbackProps {
  error: string;
  success: string;
  emailAlreadyExists: boolean;
}

export default function RegisterFeedback({ error, success, emailAlreadyExists }: RegisterFeedbackProps) {
  return (
    <>
      {error && <div role="alert" aria-live="polite" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700"><p>{error}</p>{emailAlreadyExists && <Link href="/login" className="mt-2 inline-block rounded underline underline-offset-2 hover:text-red-900">الانتقال إلى تسجيل الدخول</Link>}</div>}
      {success && <div role="status" aria-live="polite" className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700">{success}</div>}
    </>
  );
}
