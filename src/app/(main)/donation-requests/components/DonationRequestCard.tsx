import type { DonationRequest } from "@/types/donationRequest.types";

type DonationRequestCardProps = {
  request: DonationRequest;
  myOnly: boolean;
  currentUserId?: string;
  canceling: boolean;
  onOpenDetails: (requestId: string) => void;
  onOffer: (request: DonationRequest) => void;
  onCancel: (requestId: string) => void;
};

const STATUS_STYLES: Record<DonationRequest["status"], string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  fulfilled: "bg-sky-50 text-sky-700 border-sky-100",
  expired: "bg-orange-50 text-orange-700 border-orange-100",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_LABELS: Record<DonationRequest["status"], string> = {
  active: "نشط",
  fulfilled: "تمت تلبيته",
  expired: "منتهي",
  cancelled: "ملغي",
};

const URGENCY_STYLES: Record<DonationRequest["urgency"], string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-primary/55",
};

function RequestStatusBadge({ status }: { status: DonationRequest["status"] }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function DonationRequestCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-sm">
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-full bg-[#e7e1d9]" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-[#f0ebe3]" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-[#f2ede6]" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-full animate-pulse rounded-full bg-[#f0ebe3]" />
          <div className="h-3.5 w-5/6 animate-pulse rounded-full bg-[#f0ebe3]" />
          <div className="h-3.5 w-3/5 animate-pulse rounded-full bg-[#f0ebe3]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 animate-pulse rounded-2xl bg-[#f6f2eb]" />
          <div className="h-10 animate-pulse rounded-2xl bg-[#e8f5f3]" />
        </div>
      </div>
    </div>
  );
}

export default function DonationRequestCard({
  request,
  myOnly,
  currentUserId,
  canceling,
  onOpenDetails,
  onOffer,
  onCancel,
}: DonationRequestCardProps) {
  const canOffer =
    !myOnly &&
    request.status === "active" &&
    request.requester?._id !== currentUserId;

  return (
    <article className="content-panel group relative overflow-hidden p-5 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_44px_rgba(16,37,34,0.09)]">
      <span className={`absolute inset-y-0 right-0 w-1 ${URGENCY_STYLES[request.urgency]}`} />

      <div className="flex h-full flex-col">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-[#1e2526] md:text-base">
              {request.title}
            </h3>
            <RequestStatusBadge status={request.status} />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#8b847c]">
            <span className="rounded-full bg-[#f3f1ec] px-2.5 py-1 text-[#6b655e]">
              {request.category}
            </span>
            <span>بواسطة: {request.requester?.name ?? "مستخدم"}</span>
          </div>
        </div>

        <p className="mt-4 line-clamp-4 text-sm leading-7 text-[#635d56]">
          {request.description}
        </p>

        <div className="mt-5 border-t border-[#f1ece5] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {myOnly && request.fulfilledByItem && request.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => onOpenDetails(request._id)}
                  className="inline-flex items-center gap-1 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                  شخص استجاب! اضغط هنا 🎁
                </button>
              )}

              {myOnly && !request.fulfilledByItem && (
                <button
                  type="button"
                  onClick={() => onOpenDetails(request._id)}
                  className="inline-flex items-center gap-1 rounded-2xl bg-[#f3f1ec] px-4 py-2 text-xs font-black text-[#625c55] transition-colors hover:bg-[#ebe6df]"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  عرض التفاصيل
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {canOffer && (
                <button
                  type="button"
                  onClick={() => onOffer(request)}
                  className="inline-flex items-center gap-1 rounded-2xl bg-primary/10 px-4 py-2 text-xs font-black text-primary transition-colors hover:bg-primary/15"
                >
                  <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                  سأتبرع بهذا 🎁
                </button>
              )}

              {myOnly && request.status === "active" && (
                <button
                  type="button"
                  onClick={() => onCancel(request._id)}
                  disabled={canceling}
                  className="rounded-2xl bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  {canceling ? "جاري الإلغاء..." : "إلغاء الطلب"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
