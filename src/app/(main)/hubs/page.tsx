import type { Metadata } from "next";
import HubsExplorer from "./HubsExplorer";
import { getPublicHubsServer } from "@/lib/api/publicApiServer";

const siteUrl = "https://www.aoun.website";

export const metadata: Metadata = {
  title: "مراكز تسليم آمنة للتبرعات في الأردن",
  description:
    "استكشف مراكز التسليم الآمنة المتاحة عبر منصة عون لتنسيق استلام وتسليم التبرعات العينية في الأردن بطريقة أوضح وأكثر أمانًا.",
  alternates: {
    canonical: `${siteUrl}/hubs`,
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: `${siteUrl}/hubs`,
    siteName: "عون | Aoun",
    title: "مراكز تسليم آمنة للتبرعات في الأردن | عون",
    description:
      "تعرّف على مراكز التسليم الآمنة التي تساعد على تنسيق استلام وتسليم التبرعات العينية عبر عون.",
  },
  twitter: {
    card: "summary",
    title: "مراكز تسليم آمنة للتبرعات في الأردن | عون",
    description:
      "تعرّف على مراكز التسليم الآمنة التي تساعد على تنسيق استلام وتسليم التبرعات العينية عبر عون.",
  },
};

export default async function HubsPage() {
  const hubs = await getPublicHubsServer().catch(() => []);
  return <HubsExplorer initialHubs={hubs} />;
}
