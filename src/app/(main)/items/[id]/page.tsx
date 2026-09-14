import type { Metadata } from "next";
import ItemDetailsClient from "./ItemDetailsClient";
import {
  getPublicItemServer,
  resolvePublicAssetUrl,
} from "@/lib/api/publicApiServer";

const siteUrl = "https://www.aoun.website";

type ItemPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getPublicItemServer(id).catch(() => null);
  const canonical = `${siteUrl}/items/${encodeURIComponent(id)}`;

  if (!item) {
    return {
      title: "تفاصيل الغرض",
      robots: { index: false, follow: false },
      alternates: { canonical },
    };
  }

  const description =
    item.description?.trim().slice(0, 155) ||
    `${item.title} متاح للتبرع عبر منصة عون للتبرعات العينية في الأردن.`;
  const image = item.imageUrl ? resolvePublicAssetUrl(item.imageUrl) : undefined;

  return {
    title: `${item.title} للتبرع`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "ar_JO",
      url: canonical,
      siteName: "عون | Aoun",
      title: `${item.title} للتبرع | عون`,
      description,
      images: image ? [{ url: image, alt: item.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${item.title} للتبرع | عون`,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: item.status !== "مخفي",
      follow: true,
    },
  };
}

export default async function ItemDetailsPage({ params }: ItemPageProps) {
  const { id } = await params;
  const item = await getPublicItemServer(id).catch(() => null);

  const breadcrumbData = item
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
            name: "التبرعات المتاحة",
            item: `${siteUrl}/browse`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: item.title,
            item: `${siteUrl}/items/${encodeURIComponent(id)}`,
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
      <ItemDetailsClient itemId={id} initialItem={item} />
    </>
  );
}
