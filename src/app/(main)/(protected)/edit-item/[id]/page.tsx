import { redirect } from "next/navigation";

interface LegacyEditItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyEditItemPage({ params }: LegacyEditItemPageProps) {
  const { id } = await params;
  redirect(`/items/${id}/edit`);
}
