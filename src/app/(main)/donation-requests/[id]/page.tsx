import type { Metadata } from "next";
import DonationRequestDetailsClient from "./DonationRequestDetailsClient";
import { getPublicDonationRequestServer } from "@/lib/api/publicApiServer";

const siteUrl = "https://www.aoun.website";

type DonationRequestPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: DonationRequestPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicDonationRequestServer(id).catch(() => null);
  const request = result?.request;
  const canonical = `${siteUrl}/donation-requests/${encodeURIComponent(id)}`;

  if (!request) {
    return {
      title: "تفاصيل طلب التبرع",
      robots: { index: false, follow: false },
      alternates: { canonical },
    };
  }

  const description =
    request.description?.trim().slice(0, 155) ||
    `طلب احتياج بعنوان ${request.title} عبر منصة عون للتبرعات العينية في الأردن.`;

  return {
    title: `طلب ${request.title}`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "ar_JO",
      url: canonical,
      siteName: "عون | Aoun",
      title: `طلب ${request.title} | عون`,
      description,
    },
    twitter: {
      card: "summary",
      title: `طلب ${request.title} | عون`,
      description,
    },
    robots: {
      index: request.status === "active",
      follow: true,
    },
  };
}

export default async function DonationRequestDetailPage({
  params,
}: DonationRequestPageProps) {
  const { id } = await params;
  const result = await getPublicDonationRequestServer(id).catch(() => null);
  const request = result?.request ?? null;

  const breadcrumbData = request
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "عون",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "طلبات الاحتياج",
            item: `${siteUrl}/donation-requests`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: request.title,
            item: `${siteUrl}/donation-requests/${encodeURIComponent(id)}`,
          },
        ],
      }
    : null;

  return (
    <>
      {breadcrumbData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <DonationRequestDetailsClient id={id} initialRequest={request} />
    </>
  );
}
