import Link from "next/link";

import ItemCard from "@/components/ui/ItemCard";
import {
  getPublicItemsServer,
  resolvePublicAssetUrl,
} from "@/lib/api/publicApiServer";

export function LatestItemsSkeleton() {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
      aria-label="جاري تحميل أحدث التبرعات"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse bg-surface-container-high" />
          <div className="space-y-3 p-4.5">
            <div className="h-3 w-20 animate-pulse rounded-full bg-surface-container-high" />
            <div className="h-4 w-full animate-pulse rounded-full bg-surface-container-high" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-surface-container-high" />
            <div className="h-px bg-surface-container-high" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-surface-container-high" />
          </div>
        </div>
      ))}
      <span className="sr-only">يرجى الانتظار</span>
    </div>
  );
}

export default async function LatestItems() {
  const result = await getPublicItemsServer({ page: 1, limit: 4 }).catch(
    () => null
  );
  const items = result?.items.slice(0, 4) ?? [];

  if (items.length === 0) {
    return (
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
    );
  }

  return (
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
  );
}
