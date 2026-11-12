export default function DemoNotice() {
  return (
    <aside
      dir="rtl"
      role="note"
      aria-label="تنبيه: منصة عون تجريبية"
      className="relative z-10 border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm leading-7 text-amber-950"
    >
      <span className="font-bold">عون منصة تجريبية وليست خدمة تبرعات فعّالة حاليًا.</span>{" "}
      هذا الموقع مشروع تقني للعرض والتجربة فقط؛ لا تُقدَّم من خلاله مساعدات أو تبرعات حقيقية.
      يُرجى عدم إرسال طلبات مساعدة فعلية أو مشاركة بيانات شخصية حساسة.
    </aside>
  );
}
