import Image from "next/image";

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
      className="relative hidden overflow-hidden bg-[#073f39] text-white lg:sticky lg:top-20 lg:block lg:h-[calc(100dvh-5rem)] lg:min-h-[30rem] lg:self-start"
      aria-label={`عن منصة ${platformName}`}
    >
      <Image
        src="/Volunteer-Background.png"
        alt=""
        width={512}
        height={512}
        priority
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        className="pointer-events-none opacity-25 mix-blend-luminosity"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#063f3a]/76 via-[#073a36]/90 to-[#032b28]" />
      <div className="pointer-events-none absolute -bottom-36 -right-24 h-96 w-96 rounded-full border-[58px] border-white/[0.035]" />
      <div className="pointer-events-none absolute -left-28 top-1/4 h-64 w-64 rounded-full bg-[#0ca99a]/12 blur-3xl" />

      <div className="relative z-10 flex h-full items-center px-8 py-10 xl:px-12">
        <div className="w-full max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.08] px-3 py-2 text-[10px] font-black text-white/75 backdrop-blur-sm">
            <span
              className="material-symbols-outlined text-[16px] text-[#f0c77f]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            {platformName} · مجتمع عطاء منظّم
          </span>
          <h2 className="mt-5 max-w-md text-[1.9rem] font-black leading-[1.35] text-white xl:text-[2.25rem]">
            {title}
          </h2>
          <p className="mt-3 max-w-md text-[13px] font-semibold leading-7 text-white/65">
            {description}
          </p>

          <ul className="mt-6 flex max-w-lg flex-wrap gap-2">
            {POINTS.map((point) => (
              <li
                key={point.label}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-[10px] font-bold text-white/75 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-[15px] text-[#f0c77f]">
                  {point.icon}
                </span>
                {point.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
