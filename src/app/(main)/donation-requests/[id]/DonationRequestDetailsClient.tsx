"use client";

import PageIntro from "@/components/ui/PageIntro";
import type { DonationRequest } from "@/types/donationRequest.types";
import {
  AcceptedDonationSection,
  DonationRequestLoadingState,
  DonationRequestMissingState,
  FulfilledItemSection,
  MiniStat,
  OfferCallToAction,
  RequesterCard,
  RequestManagementSection,
  RequestOffersSection,
  RequestStatusBadge,
  ViewerOfferSection,
} from "./components/DonationRequestDetailsSections";
import { useDonationRequestDetails } from "./hooks/useDonationRequestDetails";

export default function DonationRequestDetailsClient({
  id,
  initialRequest,
}: {
  id: string;
  initialRequest: DonationRequest | null;
}) {
  const details = useDonationRequestDetails(id, initialRequest);

  if (details.loading) return <DonationRequestLoadingState />;
  if (!details.request) return <DonationRequestMissingState />;

  const { request } = details;

  return (
    <div className="page-shell pb-24 pt-20" dir="rtl">
      {details.toast && (
        <div
          role={details.toast.ok ? "status" : "alert"}
          aria-live={details.toast.ok ? "polite" : "assertive"}
          aria-atomic="true"
          className={`fixed left-1/2 top-20 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl px-6 py-3 text-center text-sm font-bold text-white shadow-[0_14px_35px_rgba(0,0,0,0.16)] transition-all ${
            details.toast.ok ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {details.toast.msg}
        </div>
      )}

      <div className="site-container space-y-6 md:pt-4">
        <button
          onClick={details.goBack}
          className="flex items-center gap-1 text-xs font-black text-gray-500 transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          رجوع
        </button>

        <PageIntro
          eyebrow={`طلب مجتمعي · ${request.requester?.name}`}
          title={request.title}
          description={request.description || "طلب تبرع منشور ضمن مجتمع عون."}
          icon="campaign"
          tone={request.urgency === "high" ? "warm" : "brand"}
          actions={
            <div className="grid min-w-[230px] grid-cols-2 gap-2">
              <MiniStat
                label="عدد العروض"
                value={
                  details.isOwner
                    ? details.offers.length
                    : details.viewerOffer
                      ? 1
                      : details.isAccepted
                        ? 1
                        : 0
                }
                tone="text-[#f3c36f]"
                inverted
              />
              <MiniStat
                label="الحالة الحالية"
                value={details.isAccepted ? "تمت تلبيته" : "مفتوح"}
                tone="text-white"
                inverted
              />
            </div>
          }
          meta={
            <>
              <RequestStatusBadge status={request.status} />
              <span className="data-chip">{request.category}</span>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">location_on</span>
                {request.location}
              </span>
              <span className="data-chip">
                {request.urgency === "high"
                  ? "أولوية عاجلة"
                  : request.urgency === "medium"
                    ? "أولوية متوسطة"
                    : "أولوية عادية"}
              </span>
              <span className="data-chip">
                {new Date(request.createdAt).toLocaleDateString("ar-EG")}
              </span>
            </>
          }
        />

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            {request.status === "active" && details.isOwner && !details.isAccepted && (
              <RequestOffersSection
                offers={details.offers}
                accepting={details.accepting}
                rejecting={details.rejecting}
                onAccept={details.handleAcceptOffer}
                onReject={details.handleRejectOffer}
              />
            )}

            {!details.isOwner && details.viewerOffer && (
              <ViewerOfferSection
                offer={details.viewerOffer}
                requestStatus={request.status}
                withdrawing={details.withdrawing}
                onWithdraw={details.handleWithdrawOffer}
              />
            )}

            {details.isAccepted && details.respondedItem && (
              <AcceptedDonationSection item={details.respondedItem} />
            )}

            {details.showOfferCallToAction && (
              <OfferCallToAction
                isAuthenticated={details.isAuthenticated}
                onOpen={details.openOfferForm}
              />
            )}
          </div>

          <div className="space-y-5">
            {details.isOwner && request.status === "active" && (
              <RequestManagementSection
                canceling={details.canceling}
                accepting={details.accepting}
                onCancel={details.handleCancelRequest}
              />
            )}

            {details.isAccepted && details.respondedItem && (
              <FulfilledItemSection
                item={details.respondedItem}
                onOpen={details.openFulfilledItem}
              />
            )}

            <RequesterCard request={request} />
          </div>
        </section>
      </div>
    </div>
  );
}
