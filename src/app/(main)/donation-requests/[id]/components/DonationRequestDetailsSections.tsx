"use client";

import Image from "next/image";
import type { DonationOffer, DonationRequest } from "@/types/donationRequest.types";

type FulfilledItem = NonNullable<DonationRequest["fulfilledByItem"]>;

export function DonationRequestLoadingState() {
  return (
    <div className="min-h-dvh bg-[#f7f6f2]">
      <div className="mx-auto max-w-5xl px-4 pt-20 md:px-6 md:pt-24">
        <div className="space-y-4">
          <div className="h-5 w-20 animate-pulse rounded-full bg-[#e9e4dc]" />
          <div className="rounded-[30px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="h-6 w-44 animate-pulse rounded-full bg-[#e7e1d9]" />
              <div className="h-4 w-32 animate-pulse rounded-full bg-[#f0ebe3]" />
              <div className="flex gap-2">
                {[0, 1, 2].map((key) => (
                  <div key={key} className="h-7 w-20 animate-pulse rounded-full bg-[#f2ede6]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DonationRequestMissingState() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f7f6f2]">
      <div className="rounded-3xl border border-dashed border-[#ddd7cf] bg-white px-10 py-12 text-center shadow-sm">
        <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">error</span>
        <p className="text-sm font-bold text-gray-400">الطلب غير موجود</p>
      </div>
    </div>
  );
}

export function RequestOffersSection({
  offers,
  accepting,
  rejecting,
  onAccept,
  onReject,
}: {
  offers: DonationOffer[];
  accepting: string | null;
  rejecting: string | null;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
}) {
  return (
    <section className="content-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[#1d2324]">العروض المقدمة</h2>
          <p className="mt-1 text-xs font-bold text-[#8a837b]">
            اختر العرض الأنسب لك بناءً على الحالة ونقطة التسليم.
          </p>
        </div>
        <span className="rounded-full bg-[#f3f1ec] px-3 py-1 text-[11px] font-black text-[#6b655e]">
          {offers.length} عرض
        </span>
      </div>
      {offers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#ddd7cf] bg-[#fcfbf8] p-10 text-center">
          <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">hourglass_empty</span>
          <p className="text-sm font-bold text-gray-400">لا أحد عرض التبرع بعد</p>
          <p className="mt-1 text-xs text-gray-300">ستصلك إشعارات فور تقديم أي شخص عرضاً 🔔</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              onAccept={() => onAccept(offer._id)}
              onReject={() => onReject(offer._id)}
              isAccepting={accepting === offer._id}
              isRejecting={rejecting === offer._id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function ViewerOfferSection({
  offer,
  requestStatus,
  withdrawing,
  onWithdraw,
}: {
  offer: NonNullable<DonationRequest["viewerOffer"]>;
  requestStatus: DonationRequest["status"];
  withdrawing: boolean;
  onWithdraw: () => void;
}) {
  return (
    <section className="content-panel border-primary/20 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <span className="material-symbols-outlined text-3xl">inventory</span>
      </div>
      <h2 className="mt-4 text-base font-black text-[#1d2324]">{offerStatusLabel(offer.status)}</h2>
      <p className="mt-2 text-sm leading-7 text-[#6d665f]">{offerStatusDescription(offer.status)}</p>
      {offer.status === "pending" && requestStatus === "active" && (
        <button
          type="button"
          onClick={onWithdraw}
          disabled={withdrawing}
          className="mt-5 w-full rounded-2xl bg-red-50 py-3 text-sm font-black text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
        >
          {withdrawing ? "جارٍ سحب العرض..." : "سحب العرض"}
        </button>
      )}
    </section>
  );
}

export function AcceptedDonationSection({ item }: { item: FulfilledItem }) {
  return (
    <section className="content-panel border-primary/20 p-5">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[22px] text-primary">handshake</span>
        <h2 className="text-base font-black text-[#1d2324]">تفاصيل التبرع المقبول 🎉</h2>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoRow label="المتبرع" value={item.donor?.name ?? "—"} />
        <InfoRow label="حالة الغرض" value={item.condition ?? "—"} />
      </div>
      {item.safeHub && (
        <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <p className="text-xs font-black text-primary">📍 نقطة التسليم الآمنة</p>
          <p className="mt-1 text-sm font-bold text-gray-800">
            {item.safeHub.name} — {item.safeHub.city}
          </p>
          {item.safeHub.address && <p className="mt-1 text-xs text-gray-500">{item.safeHub.address}</p>}
        </div>
      )}
    </section>
  );
}

export function OfferCallToAction({
  isAuthenticated,
  onOpen,
}: {
  isAuthenticated: boolean;
  onOpen: () => void;
}) {
  return (
    <section className="content-panel border-primary/20 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
      </div>
      <h2 className="mt-4 text-base font-black text-[#1d2324]">هل تريد التبرع بهذا الغرض؟</h2>
      <p className="mt-2 text-sm leading-7 text-[#6d665f]">
        يمكنك تقديم عرض تبرع مرتبط بهذا الطلب، ثم سيتمكن صاحب الطلب من مراجعته واختياره.
      </p>
      <button
        onClick={onOpen}
        className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-black text-white transition-all hover:bg-primary/90"
      >
        {isAuthenticated ? "🎁 أريد التبرع" : "سجّل دخولك لتقديم عرض"}
      </button>
    </section>
  );
}

export function RequestManagementSection({
  canceling,
  accepting,
  onCancel,
}: {
  canceling: boolean;
  accepting: string | null;
  onCancel: () => void;
}) {
  return (
    <section className="content-panel border-red-100 p-5">
      <h2 className="text-sm font-black text-[#1f2526]">إدارة الطلب</h2>
      <p className="mt-2 text-xs leading-6 text-gray-500">
        إلغاء الطلب يوقف كل العروض المعلقة ويبلغ أصحابها.
      </p>
      <button
        type="button"
        onClick={onCancel}
        disabled={canceling || accepting !== null}
        className="mt-4 w-full rounded-2xl bg-red-50 py-3 text-xs font-black text-red-600 hover:bg-red-100 disabled:opacity-50"
      >
        {canceling ? "جارٍ إلغاء الطلب..." : "إلغاء الطلب"}
      </button>
    </section>
  );
}

export function FulfilledItemSection({
  item,
  onOpen,
}: {
  item: FulfilledItem;
  onOpen: (itemId: string) => void;
}) {
  return (
    <section className="content-panel p-5">
      <h2 className="text-sm font-black text-[#1f2526]">متابعة الغرض</h2>
      <p className="mt-2 text-sm leading-7 text-[#716a62]">
        يمكنك استعراض الصفحة الكاملة للغرض المرتبط بهذا الطلب لمشاهدة التفاصيل والصور.
      </p>
      <button
        onClick={() => onOpen(item._id)}
        className="mt-4 w-full rounded-2xl bg-primary py-3 text-xs font-black text-white transition-all hover:bg-primary/90"
      >
        عرض صفحة الغرض كاملة ←
      </button>
    </section>
  );
}

export function RequesterCard({ request }: { request: DonationRequest }) {
  return (
    <section className="content-panel p-5">
      <h2 className="text-sm font-black text-[#1f2526]">صاحب الطلب</h2>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-black text-primary">
          {request.requester?.name?.charAt(0) ?? "U"}
        </div>
        <div>
          <p className="text-sm font-black text-[#1d2324]">{request.requester?.name}</p>
          <p className="text-xs font-bold text-[#8b847c]">
            تاريخ الإنشاء: {new Date(request.createdAt).toLocaleDateString("ar-EG")}
          </p>
        </div>
      </div>
    </section>
  );
}

export function MiniStat({
  label,
  value,
  tone = "text-[#1f2526]",
  inverted = false,
}: {
  label: string;
  value: string | number;
  tone?: string;
  inverted?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 text-center ${inverted ? "border-white/12 bg-white/[0.08]" : "border-black/[0.05] bg-[#fcfbf8]"}`}>
      <p className={`text-base font-black ${tone}`}>{value}</p>
      <p className={`mt-1 text-[10px] font-bold ${inverted ? "text-white/50" : "text-gray-400"}`}>{label}</p>
    </div>
  );
}

export function RequestStatusBadge({ status }: { status: DonationRequest["status"] }) {
  const styles: Record<DonationRequest["status"], string> = {
    active: "bg-green-50 text-green-700 border-green-100",
    fulfilled: "bg-blue-50 text-blue-700 border-blue-100",
    expired: "bg-orange-50 text-orange-700 border-orange-100",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const labels: Record<DonationRequest["status"], string> = {
    active: "نشط",
    fulfilled: "تمت تلبيته",
    expired: "منتهي",
    cancelled: "ملغي",
  };
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function OfferCard({
  offer,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: {
  offer: DonationOffer;
  onAccept: () => void;
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-[#fcfbf8] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-base font-black text-primary">
          {offer.donor?.name?.charAt(0) ?? "D"}
        </div>
        <div>
          <p className="text-sm font-black text-[#1d2324]">{offer.donor?.name}</p>
          <p className="text-xs text-gray-400">
            Level {offer.donor?.trustLevel ?? 1} · {offer.donor?.trustScore ?? 0} نقطة
          </p>
        </div>
        <div className="mr-auto flex flex-col items-end gap-1">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#6b655e]">{offer.condition}</span>
          <span className="text-[10px] font-black text-primary">{offerStatusLabel(offer.status)}</span>
        </div>
      </div>
      {offer.imageUrl && (
        <div className="relative mt-4 h-44 w-full overflow-hidden rounded-2xl">
          <Image src={offer.imageUrl} alt="صورة الغرض" fill className="object-cover" sizes="(max-width: 640px) 100vw, 640px" />
        </div>
      )}
      {offer.description && <p className="mt-4 text-sm leading-7 text-[#625c55]">{offer.description}</p>}
      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
        <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
        {offer.safeHub?.name} — {offer.safeHub?.city}
      </div>
      {offer.status === "pending" ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onAccept} disabled={isAccepting || isRejecting} className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-all hover:bg-primary/90 disabled:opacity-50">
            {isAccepting ? "جاري الاختيار..." : "✅ قبول"}
          </button>
          <button type="button" onClick={onReject} disabled={isAccepting || isRejecting} className="rounded-2xl bg-red-50 py-3 text-sm font-black text-red-600 transition-all hover:bg-red-100 disabled:opacity-50">
            {isRejecting ? "جاري الرفض..." : "رفض"}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-gray-100 py-3 text-center text-xs font-black text-gray-500">
          {offerStatusLabel(offer.status)}
        </div>
      )}
    </div>
  );
}

function offerStatusLabel(status: DonationOffer["status"]) {
  const labels: Record<DonationOffer["status"], string> = {
    pending: "قيد المراجعة",
    accepted: "تم القبول",
    rejected: "مرفوض",
    withdrawn: "تم سحبه",
    cancelled_by_requester: "الطلب ملغي",
    request_expired: "انتهت مدة الطلب",
  };
  return labels[status];
}

function offerStatusDescription(status: DonationOffer["status"]) {
  const descriptions: Record<DonationOffer["status"], string> = {
    pending: "عرضك وصل إلى صاحب الطلب وما زال بانتظار قراره.",
    accepted: "تم اختيار عرضك. يمكنك متابعة الغرض وإجراءات التسليم من هذه الصفحة.",
    rejected: "تم اختيار عرض آخر. حفاظاً على الخصوصية لن تظهر لك بيانات الغرض أو المتبرع الذي تم اختياره.",
    withdrawn: "سحبت عرضك لهذا الطلب، ولن تظهر لك بيانات أي عرض يتم اختياره.",
    cancelled_by_requester: "ألغى صاحب الطلب طلبه، لذلك أُغلق عرضك تلقائياً.",
    request_expired: "انتهت مدة الطلب قبل اختيار عرضك.",
  };
  return descriptions[status];
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f8f6f2] p-4">
      <p className="mb-1 text-[10px] font-black text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}
