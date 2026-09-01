import Image from "next/image";
import Link from "next/link";
import ItemCard from "@/components/ui/ItemCard";
import { siteConfig } from "@/config/site.config";
import {
  getPublicItemsServer,
  resolvePublicAssetUrl,
} from "@/lib/api/publicApiServer";
import { getServerPublicSettings } from "@/lib/api/publicSettingsServer";

const FEATURES = [
  { icon: "person_add", t: "سجّل حسابك", d: "انضم لمجتمعنا بخطوات بسيطة وآمنة لحماية خصوصيتك." },
  { icon: "add_box", t: "أضف غرضاً أو اطلبه", d: "اعرض ما لا تحتاجه أو تصفح ما يحتاجه الآخرون بكل سهولة." },
  { icon: "handshake", t: "تم اللقاء والتبادل", d: "نسّق موعد الاستلام في مكان عام وآمن للجميع." },
  { icon: "star", t: "قيّم تجربتك", d: "ساهم في بناء مجتمع الثقة من خلال تقييم التبادل." },
] as const;

const ENTRY_PATHS = [
  {
    icon: "volunteer_activism",
    title: "لديّ غرض أريد التبرع به",
    description: "أضف صورته وتفاصيله، واختر طريقة تسليم مناسبة وآمنة.",
    href: "/add-item",
    action: "إضافة تبرع",
    tone: "bg-primary text-white",
  },
  {
    icon: "search",
    title: "أبحث عن غرض متاح",
    description: "تصفّح التبرعات حسب المدينة والتصنيف والحالة.",
    href: "/browse",
    action: "استكشاف الأغراض",
    tone: "bg-[#173f3b] text-white",
  },
  {
    icon: "campaign",
    title: "أحتاج غرضًا محددًا",
    description: "انشر احتياجك ليتمكن المتبرعون المناسبون من تقديم عروضهم.",
    href: "/donation-requests/new",
    action: "إنشاء طلب",
    tone: "bg-secondary text-white",
  },
] as const;

const TRUST_POINTS = [
  { icon: "verified_user", label: "هوية وثقة متدرّجة" },
  { icon: "handshake", label: "تأكيد تسليم من الطرفين" },
  { icon: "warehouse", label: "مراكز تسليم آمنة" },
] as const;

export default async function HomePage() {
  const [settings, itemResult] = await Promise.all([
    getServerPublicSettings(),
    getPublicItemsServer({ page: 1, limit: 4 }).catch(() => null),
  ]);
  const platformName = settings?.platformName ?? siteConfig.name;
  const items = itemResult?.items.slice(0, 4) ?? [];

  return (
    <div className="overflow-x-clip bg-surface text-on-surface" dir="rtl">
      <section className="px-4 pb-12 pt-22 md:px-6 md:pb-18 md:pt-26">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#073f39] text-white shadow-[0_28px_70px_rgba(7,63,57,0.2)] md:rounded-[36px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.11),transparent_28rem)]" />
          <div className="pointer-events-none absolute -bottom-40 -right-32 h-100 w-100 rounded-full border-[70px] border-white/[0.035]" />

          <div className="relative grid items-center gap-9 px-5 py-9 sm:px-8 md:px-12 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-16">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-3.5 py-2 text-xs font-extrabold text-white/85 backdrop-blur-sm">
                <span
                  className="material-symbols-outlined text-[17px] text-[#f0c77f]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
                منصة مجتمعية للتبرع العيني
              </div>

              <h1 className="max-w-2xl text-[2.45rem] font-black leading-[1.12] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.7rem]">
                ما لا تحتاجه اليوم
                <span className="mt-1 block text-[#f0c77f]">قد يصنع فرقًا غدًا</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-8 text-white/70 sm:text-base md:leading-9">
                {platformName} يربط المتبرعين بمن يحتاجون الأغراض بطريقة واضحة تحفظ
                الكرامة، وتسهّل التنسيق، وتبني الثقة خطوة بخطوة.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/add-item"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-6 py-3 text-sm font-black text-primary-container shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:bg-[#f8fffc]"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    add_circle
                  </span>
                  تبرع بغرض الآن
                </Link>
                <Link
                  href="/browse"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-white/18 bg-white/[0.08] px-6 py-3 text-sm font-extrabold text-white backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white/[0.14]"
                >
                  تصفّح التبرعات
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                </Link>
              </div>

              <div className="mt-8 grid gap-2.5 sm:grid-cols-3">
                {TRUST_POINTS.map((point) => (
                  <div
                    key={point.label}
                    className="flex items-center gap-2.5 rounded-[14px] border border-white/10 bg-black/10 px-3 py-3 text-[11px] font-bold text-white/75"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#f0c77f]">
                      {point.icon}
                    </span>
                    {point.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute inset-8 rounded-full bg-[#86c5ae]/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[26px] border border-white/12 bg-[#dbe6c6] p-3 shadow-2xl shadow-black/20 md:rounded-[30px]">
                <div className="relative aspect-square overflow-hidden rounded-[20px] bg-[#cad8b2] md:rounded-[24px]">
                  <Image
                    src="/Home.png"
                    alt={`مجتمع ${platformName} يتعاون لتبادل الخير`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 42vw"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="absolute -bottom-4 right-4 max-w-[15rem] rounded-[16px] border border-white/30 bg-white p-3.5 text-on-surface shadow-xl md:-right-5 md:bottom-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      shield
                    </span>
                  </span>
                  <div>
                    <p className="text-xs font-black">تبادل أكثر أمانًا</p>
                    <p className="mt-0.5 text-[10px] leading-5 text-on-surface-soft">
                      خطوات واضحة من الحجز حتى التسليم
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-22">
        <div className="site-container">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">
                <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                وصل حديثًا
              </span>
              <h2 className="section-title mt-3">تبرعات متاحة الآن</h2>
              <p className="mt-2 max-w-xl text-sm text-on-surface-soft">
                ابدأ من أحدث الأغراض، أو استخدم البحث للوصول لما يناسبك.
              </p>
            </div>
            <Link href="/browse" className="btn-secondary self-start sm:self-auto">
              عرض كل الأغراض
              <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            </Link>
          </div>

          {items.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, index) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  imageSrc={resolvePublicAssetUrl(item.imageUrl)}
                  priority={index < 2}
                />
              ))}
            </div>
          ) : (
            <div className="surface-card px-6 py-12 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <span className="material-symbols-outlined text-[28px]">inventory_2</span>
              </span>
              <h3 className="mt-4 text-lg font-black">لا توجد أغراض معروضة حاليًا</h3>
              <p className="mt-2 text-sm text-on-surface-soft">
                كن أول من يضيف تبرعًا ويبدأ دائرة خير جديدة.
              </p>
              <Link href="/add-item" className="btn-primary mt-5">
                إضافة أول تبرع
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-white py-16 md:py-22">
        <div className="site-container">
          <div className="max-w-2xl">
            <span className="eyebrow">اختر ما تريد إنجازه</span>
            <h2 className="section-title mt-3">ثلاث طرق بسيطة لتبدأ</h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-soft md:text-base">
              لا تحتاج لمعرفة كل تفاصيل المنصة؛ اختر هدفك وسنقودك للخطوة المناسبة.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {ENTRY_PATHS.map((path, index) => (
              <Link
                key={path.href}
                href={path.href}
                className={`group relative overflow-hidden rounded-[22px] p-6 shadow-md transition-transform hover:-translate-y-1 ${path.tone}`}
              >
                <span className="absolute left-5 top-4 font-headline text-6xl font-black text-white/[0.07]">
                  0{index + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white/12">
                  <span
                    className="material-symbols-outlined text-[23px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {path.icon}
                  </span>
                </span>
                <h3 className="mt-5 text-xl font-black text-white">{path.title}</h3>
                <p className="mt-2 min-h-14 text-sm leading-7 text-white/72">
                  {path.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-black text-white">
                  {path.action}
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">
                    arrow_back
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 md:py-22">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">من الإضافة إلى التسليم</span>
            <h2 className="section-title mt-3">رحلة واضحة في أربع خطوات</h2>
            <p className="mt-3 text-sm text-on-surface-soft md:text-base">
              صممنا كل خطوة لتكون مفهومة، قابلة للتتبع، وتحفظ حق الطرفين.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <li
                key={feature.t}
                className="relative rounded-[20px] border border-black/[0.07] bg-white p-5 shadow-sm"
              >
                <span className="absolute left-4 top-4 font-headline text-sm font-black text-primary/30">
                  0{index + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-primary-soft text-primary">
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {feature.icon}
                  </span>
                </span>
                <h3 className="mt-5 text-base font-black">{feature.t}</h3>
                <p className="mt-2 text-xs leading-6 text-on-surface-soft">{feature.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pb-16 md:pb-22">
        <div className="site-container">
          <div className="grid overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-md lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-72 overflow-hidden bg-surface-container-low lg:min-h-96">
              <Image
                src="/Volunteer-Background.png"
                alt="يدان تتصافحان تعبيرًا عن الثقة والتعاون"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-primary-container/45 to-transparent" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
              <span className="eyebrow self-start">الثقة قبل كل شيء</span>
              <h2 className="section-title mt-4">تسليم منظم يحمي التجربة</h2>
              <p className="mt-4 text-sm leading-8 text-on-surface-variant md:text-base">
                يمكنك التنسيق المباشر أو اختيار مركز تسليم آمن، مع إشعارات فورية
                وتأكيد مستقل من المتبرع والمستفيد قبل إغلاق العملية.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/hubs" className="btn-primary">
                  استكشاف مراكز التسليم
                </Link>
                <Link href="/donation-requests" className="btn-secondary">
                  عرض الاحتياجات
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-primary px-6 py-10 text-center text-white md:px-12 md:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_130%,rgba(255,255,255,0.18),transparent_28rem)]" />
          <div className="relative mx-auto max-w-2xl">
            <span className="material-symbols-outlined text-[34px] text-[#f0c77f]">
              volunteer_activism
            </span>
            <h2 className="mt-3 text-3xl font-black text-white">غرض واحد قد يبدأ أثرًا كبيرًا</h2>
            <p className="mt-3 text-sm leading-7 text-white/72 md:text-base">
              أضف ما لم تعد تحتاجه، واترك لـ{platformName} مهمة تسهيل الرحلة.
            </p>
            <Link
              href="/add-item"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-7 py-3 text-sm font-black text-primary-container shadow-lg hover:-translate-y-0.5"
            >
              ابدأ التبرع الآن
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
