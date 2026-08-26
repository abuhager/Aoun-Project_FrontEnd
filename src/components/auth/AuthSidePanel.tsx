import Image from "next/image";
import BrandMark from "@/components/ui/BrandMark";

interface AuthSidePanelProps {
  platformName: string;
  title?: string;
  description?: string;
}

const POINTS = [
  { icon: "fact_check", label: "تفاصيل واضحة قبل الحجز" },
  { icon: "warehouse", label: "خيارات تسليم أكثر أمانًا" },
  { icon: "handshake", label: "تأكيد مستقل من الطرفين" },
] as const;

export default function AuthSidePanel({
  platformName,
  title = "شارك ما لديك، واطلب ما تحتاجه بكرامة",
  description = "تجربة منظّمة تساعدك من أول خطوة حتى اكتمال التسليم.",
}: AuthSidePanelProps) {
  return (
    <aside
      className="relative hidden overflow-hidden bg-[#073f39] text-white lg:flex lg:w-[46%] lg:flex-col lg:justify-between"
      aria-label={`عن منصة ${platformName}`}
    >
      <Image
        src="/Volunteer-Background.png"
        alt=""
        fill
        priority
        sizes="46vw"
        className="object-cover opacity-25 mix-blend-luminosity"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#073f39]/70 via-[#073f39]/80 to-[#073f39]" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full border-[64px] border-white/[0.035]" />

      <div className="relative p-10 xl:p-14">
        <BrandMark name={platformName} inverted tagline="العطاء أقرب وأسهل" />
      </div>

      <div className="relative max-w-xl p-10 xl:p-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-3 py-2 text-xs font-black text-white/75 backdrop-blur-sm">
          <span
            className="material-symbols-outlined text-[16px] text-[#f0c77f]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          مجتمع عطاء منظم
        </span>
        <h2 className="mt-5 text-3xl font-black leading-[1.35] text-white xl:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-8 text-white/62">{description}</p>

        <ul className="mt-8 grid gap-3">
          {POINTS.map((point) => (
            <li
              key={point.label}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-xs font-bold text-white/72 backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-[#f0c77f]">
                {point.icon}
              </span>
              {point.label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
