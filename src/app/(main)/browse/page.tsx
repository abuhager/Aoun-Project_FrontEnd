import type { Metadata } from "next";
import Link from "next/link";
import BrowseExperience from "@/components/browse/BrowseExperience";
import PageIntro from "@/components/ui/PageIntro";
import { getPublicItemsServer } from "@/lib/api/publicApiServer";
import { getServerPublicSettings } from "@/lib/api/publicSettingsServer";
import {
  getBrowseSearchRequestValue,
  normalizeBrowseSearchInput,
} from "@/lib/navigation/browseSearch";

const siteUrl = "https://www.aoun.website";

export const metadata: Metadata = {
  title: "تبرعات عينية متاحة في الأردن",
  description:
    "تصفح التبرعات العينية المتاحة عبر منصة عون في الأردن، وابحث عن الأغراض حسب المدينة والتصنيف والحالة ثم نسّق الحجز والتسليم بسهولة.",
  alternates: {
    canonical: `${siteUrl}/browse`,
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: `${siteUrl}/browse`,
    siteName: "عون | Aoun",
    title: "تبرعات عينية متاحة في الأردن | عون",
    description:
      "اكتشف أغراضًا متاحة للتبرع في الأردن وابحث حسب المدينة والتصنيف عبر منصة عون.",
  },
  twitter: {
    card: "summary",
    title: "تبرعات عينية متاحة في الأردن | عون",
    description:
      "اكتشف أغراضًا متاحة للتبرع في الأردن وابحث حسب المدينة والتصنيف عبر منصة عون.",
  },
};

type BrowseSearchParams = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const normalizePage = (value: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<BrowseSearchParams>;
}) {
  const rawParams = await searchParams;
  const values = {
    search: normalizeBrowseSearchInput(firstValue(rawParams.search)),
    location: firstValue(rawParams.location).trim(),
    category: firstValue(rawParams.category).trim(),
    page: normalizePage(firstValue(rawParams.page)),
  };
  const requestSearch = getBrowseSearchRequestValue(values.search);

  const [settings, result] = await Promise.all([
    getServerPublicSettings(),
    getPublicItemsServer({
      page: values.page,
      limit: 12,
      search: requestSearch || undefined,
      location: values.location || undefined,
      category: values.category || undefined,
    }).catch(() => null),
  ]);

  const total = result?.total ?? 0;
  const categories = settings?.categories ?? [];
  const locations = settings?.locations ?? ["عمان", "إربد", "الزرقاء", "العقبة"];

  return (
    <div className="page-shell pb-20 pt-20" dir="rtl">
      <div className="site-container space-y-6 md:pt-4">
        <PageIntro
          eyebrow="تبرعات عينية في الأردن"
          title="اكتشف التبرعات المتاحة عبر منصة عون"
          description="ابحث بالاسم أو المدينة أو التصنيف، ثم راجع حالة الغرض وخيار التسليم قبل إرسال طلب الحجز."
          icon="travel_explore"
          actions={
            <Link
              href="/add-item"
              className="rounded-xl bg-white px-5 py-3 text-xs font-black text-primary-container shadow-lg hover:-translate-y-0.5"
            >
              <span
                className="material-symbols-outlined ml-1 text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add_circle
              </span>
              إضافة تبرع
            </Link>
          }
          meta={
            <>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                {result ? `${total} غرض متاح` : "تعذّر تحديث النتائج"}
              </span>
              <span className="data-chip">حجز منظم</span>
              <span className="data-chip">تسليم موثّق من الطرفين</span>
            </>
          }
        />

        <BrowseExperience
          initialResult={result}
          initialValues={values}
          categories={categories}
          locations={locations}
        />
      </div>
    </div>
  );
}
