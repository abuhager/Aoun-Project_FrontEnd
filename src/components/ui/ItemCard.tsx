import Image from "next/image";
import Link from "next/link";
import type { Item } from "@/types/item.types";

interface ItemCardProps {
  item: Item;
  imageSrc?: string;
  priority?: boolean;
}

export default function ItemCard({ item, imageSrc, priority = false }: ItemCardProps) {
  const isBooked = item.status === "محجوز";
  const safeImageSrc = imageSrc || item.imageUrl || "/placeholder.svg";

  return (
    <Link
      href={`/items/${item._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-black/[0.08] bg-white shadow-[0_8px_28px_rgba(23,33,31,0.05)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_44px_rgba(23,33,31,0.1)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
        <Image
          src={safeImageSrc}
          alt={item.title ? `صورة ${item.title}` : "صورة الغرض المتبرع به"}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
            isBooked ? "saturate-[0.65]" : ""
          }`}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="rounded-lg border border-white/25 bg-white/90 px-2.5 py-1 text-[11px] font-extrabold text-on-surface shadow-sm backdrop-blur-md">
            {item.condition || "حالة غير محددة"}
          </span>
          <span
            className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm ${
              isBooked ? "bg-warning" : "bg-primary"
            }`}
          >
            {isBooked ? "محجوز" : "متاح"}
          </span>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 text-white">
          <span className="inline-flex min-w-0 items-center gap-1 rounded-lg bg-black/25 px-2.5 py-1.5 text-[11px] font-bold backdrop-blur-md">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            <span className="truncate">{item.location || "الموقع غير محدد"}</span>
          </span>
          {isBooked && (item.waitlistCount ?? 0) > 0 && (
            <span className="rounded-lg bg-black/25 px-2.5 py-1.5 text-[11px] font-bold backdrop-blur-md">
              {item.waitlistCount} انتظار
            </span>
          )}
        </div>
      </div>

      <div className="flex grow flex-col p-4.5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[11px] font-extrabold text-primary">{item.category}</span>
          <span className="text-[10px] font-bold text-on-surface-soft">تبرع عيني</span>
        </div>
        <h3 className="line-clamp-2 text-[15px] font-black leading-7 text-on-surface">
          {item.title}
        </h3>

        <span className="mt-4 inline-flex items-center gap-1.5 border-t border-black/[0.06] pt-3 text-xs font-extrabold text-primary">
          {isBooked ? "التفاصيل وقائمة الانتظار" : "عرض التفاصيل"}
          <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
        </span>
      </div>
    </Link>
  );
}
