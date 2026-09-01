import type { Metadata } from "next";
import ItemDetailsClient from "./ItemDetailsClient";
import { getPublicItemServer } from "@/lib/api/publicApiServer";

type ItemPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getPublicItemServer(id).catch(() => null);
  if (!item) return { title: "تفاصيل الغرض" };
  return {
    title: item.title,
    description: item.description?.slice(0, 155) || `تفاصيل غرض ${item.title} المتاح عبر عون`,
  };
}

export default async function ItemDetailsPage({ params }: ItemPageProps) {
  const { id } = await params;
  const item = await getPublicItemServer(id).catch(() => null);
  return <ItemDetailsClient itemId={id} initialItem={item} />;
}
