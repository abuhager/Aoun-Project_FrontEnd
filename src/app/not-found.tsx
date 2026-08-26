import Link from "next/link";

export default function NotFound() {
  return (
    <main
      dir="rtl"
      className="flex min-h-[70dvh] items-center justify-center px-4 py-16"
    >
      <section className="surface-card w-full max-w-xl p-8 text-center md:p-12">
        <p className="text-7xl font-black text-primary/20">404</p>
        <h1 className="mt-4 text-2xl font-black text-[#1e2526]">
          الصفحة غير موجودة
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-[#6f6962]">
          قد يكون الرابط تغيّر أو أن الصفحة لم تعد متاحة.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white"
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            home
          </span>
          العودة للرئيسية
        </Link>
      </section>
    </main>
  );
}
