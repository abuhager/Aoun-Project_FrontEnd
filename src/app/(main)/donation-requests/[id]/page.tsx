import type { Metadata } from "next";
import DonationRequestDetailsClient from "./DonationRequestDetailsClient";
import { getPublicDonationRequestServer } from "@/lib/api/publicApiServer";

type DonationRequestPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: DonationRequestPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicDonationRequestServer(id).catch(() => null);
  const request = result?.request;
  return request
    ? {
        title: request.title,
        description:
          request.description?.slice(0, 155) ||
          `طلب تبرع بعنوان ${request.title} عبر منصة عون`,
      }
    : { title: "تفاصيل طلب التبرع" };
}

export default async function DonationRequestDetailPage({
  params,
}: DonationRequestPageProps) {
  const { id } = await params;
  const result = await getPublicDonationRequestServer(id).catch(() => null);
  return (
    <DonationRequestDetailsClient
      id={id}
      initialRequest={result?.request ?? null}
    />
  );
}
