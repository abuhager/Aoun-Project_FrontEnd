"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageIntro from "@/components/ui/PageIntro";
import type { DonationRequestsListResponse } from "@/types/donationRequest.types";
import DonationOfferDialog from "./components/DonationOfferDialog";
import DonationRequestFilters from "./components/DonationRequestFilters";
import DonationRequestsList from "./components/DonationRequestsList";
import { useDonationRequests } from "./hooks/useDonationRequests";

type DonationRequestsClientProps = {
  initialData: DonationRequestsListResponse | null;
};

export default function DonationRequestsClient({
  initialData,
}: DonationRequestsClientProps) {
  const router = useRouter();
  const requests = useDonationRequests(initialData);

  return (
    <div className="page-shell pb-24 pt-20" dir="rtl">
      {requests.toast && (
        <div
          role={requests.toast.ok ? "status" : "alert"}
          aria-live={requests.toast.ok ? "polite" : "assertive"}
          aria-atomic="true"
          className={`fixed left-1/2 top-24 z-[60] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl px-5 py-3 text-center text-sm font-black text-white shadow-[0_14px_35px_rgba(0,0,0,0.16)] ${
            requests.toast.ok ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {requests.toast.msg}
        </div>
      )}

      <div className="site-container max-w-6xl space-y-6 md:pt-4">
        <PageIntro
          eyebrow="احتياج واضح · استجابة كريمة"
          title="طلبات التبرع"
          description="استعرض الاحتياجات المنشورة وساهم بما تستطيع، أو أنشئ طلبًا يحفظ خصوصيتك ويعطي المتبرعين تفاصيل كافية للمساعدة."
          icon="campaign"
          tone="warm"
          actions={
            <Link
              href="/donation-requests/new"
              className="rounded-xl bg-white px-5 py-3 text-xs font-black text-[#633b17] shadow-lg hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined ml-1 text-[16px]">add</span>
              إنشاء طلب جديد
            </Link>
          }
          meta={
            <>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">list_alt</span>
                {requests.loading
                  ? "جارٍ تحميل الطلبات"
                  : `${requests.requests.length} طلب في هذه الصفحة`}
              </span>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">lock</span>
                بيانات التواصل محمية
              </span>
              {requests.mounted && requests.myOnly && (
                <span className="data-chip">
                  لديك {requests.activeMineCount} طلب نشط
                </span>
              )}
            </>
          }
        />

        <DonationRequestFilters
          myOnly={requests.myOnly}
          categories={requests.categories}
          locations={requests.locations}
          selectedCategory={requests.selectedCategory}
          selectedLocation={requests.selectedLocation}
          onShowAll={requests.showAll}
          onShowMine={requests.showMine}
          onCategoryChange={requests.setSelectedCategory}
          onLocationChange={requests.setSelectedLocation}
        />

        <DonationRequestsList
          requests={requests.requests}
          loading={requests.loading}
          loadError={requests.loadError}
          myOnly={requests.myOnly}
          currentUserId={requests.currentUserId}
          cancelingId={requests.cancelingId}
          page={requests.page}
          pages={requests.pages}
          onRetry={requests.retry}
          onOpenDetails={(requestId) =>
            router.push(requests.requestDetailsHref(requestId))
          }
          onOffer={requests.openOffer}
          onCancel={requests.cancelRequest}
          onPageChange={requests.writePageToHistory}
        />
      </div>

      <DonationOfferDialog
        request={requests.respondingTo}
        form={requests.respondForm}
        hubs={requests.hubs}
        requireHub={requests.requireHubForBooking}
        imagePreview={requests.imagePreview}
        submitting={requests.submitting}
        onChange={requests.updateRespondForm}
        onImageChange={requests.handleImageChange}
        onRemoveImage={requests.clearOfferImage}
        onSubmit={requests.submitOffer}
        onClose={requests.closeOffer}
      />
    </div>
  );
}
