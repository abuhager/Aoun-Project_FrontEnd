import Image from "next/image";
import Link from "next/link";

interface ProfileCardProps {
  name?: string;
  email?: string;
  avatar?: string;
  trustScore?: number;
}

export function ProfileCard({
  name,
  email,
  avatar,
  trustScore = 0,
}: ProfileCardProps) {
  const normalizedTrustScore = Math.min(100, Math.max(0, trustScore));
  const trustLabel =
    trustScore >= 90
      ? "عضو موثوق"
      : trustScore >= 70
      ? "ثقة جيدة"
      : trustScore >= 40
      ? "قيد التحسين"
      : "ابدأ ببناء الثقة";

  return (
    <section className="relative overflow-hidden rounded-[20px] border border-black/[0.06] bg-[#073f39] p-5 text-white shadow-md md:p-6">
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full border-[42px] border-white/[0.035]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.10),transparent_20rem)]" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-inner">
              {avatar ? (
                <Image src={avatar} alt={`صورة ${name || "المستخدم"}`} fill sizes="64px" className="object-cover" />
              ) : (
                <span
                  className="material-symbols-outlined text-[36px] text-white/75"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_circle
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white/50">ملفك الشخصي</p>
              <h2 className="mt-1 truncate text-xl font-black text-white md:text-2xl">
                {name || "مستخدم"}
              </h2>
              <p dir="ltr" className="mt-1 truncate text-left text-xs text-white/55">
                {email || "لا يوجد بريد إلكتروني"}
              </p>
            </div>
          </div>

          <Link
            href="/profile/edit"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 self-start rounded-xl border border-white/12 bg-white/[0.08] px-3 text-xs font-black text-white/80 hover:bg-white/[0.14] hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
            تعديل الحساب
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0c77f]/15 text-[#f0c77f]">
                <span
                  className="material-symbols-outlined text-[17px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
              </span>
              <div>
                <p className="text-xs font-black text-white">{trustLabel}</p>
                <p className="mt-0.5 text-[10px] text-white/45">مؤشر الثقة في المجتمع</p>
              </div>
            </div>
            <p className="text-lg font-black tabular-nums text-[#f0c77f]">
              {trustScore}
              <span className="mr-1 text-[10px] text-white/40">نقطة</span>
            </p>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="مستوى الثقة"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={normalizedTrustScore}
          >
            <div
              className="h-full rounded-full bg-[#f0c77f]"
              style={{ width: `${normalizedTrustScore}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
