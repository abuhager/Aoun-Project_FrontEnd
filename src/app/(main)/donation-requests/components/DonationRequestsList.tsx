import PaginationControls from "@/components/ui/PaginationControls";
import RequestState from "@/components/ui/RequestState";
import type { NormalizedApiError } from "@/lib/api/apiError";
import type { DonationRequest } from "@/types/donationRequest.types";
import DonationRequestCard, {
  DonationRequestCardSkeleton,
} from "./DonationRequestCard";

type DonationRequestsListProps = {
  requests: DonationRequest[];
  loading: boolean;
  loadError: NormalizedApiError | null;
  myOnly: boolean;
  currentUserId?: string;
  cancelingId: string | null;
  page: number;
  pages: number;
  onRetry: () => void;
  onOpenDetails: (requestId: string) => void;
  onOffer: (request: DonationRequest) => void;
  onCancel: (requestId: string) => void;
  onPageChange: (page: number) => void;
};

export default function DonationRequestsList({
  requests,
  loading,
  loadError,
  myOnly,
  currentUserId,
  cancelingId,
  page,
  pages,
  onRetry,
  onOpenDetails,
  onOffer,
  onCancel,
  onPageChange,
}: DonationRequestsListProps) {
  return (
    <section className="mx-auto max-w-5xl space-y-4" aria-label="قائمة طلبات التبرع">
      {loading ? (
        <div
          className="grid gap-4 md:grid-cols-2"
          role="status"
          aria-label="جارٍ تحميل طلبات التبرع"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <DonationRequestCardSkeleton key={index} />
          ))}
        </div>
      ) : loadError ? (
        <RequestState
          error={loadError.message}
          referenceId={loadError.requestId}
          onRetry={onRetry}
          className="border-dashed"
        />
      ) : requests.length === 0 ? (
        <RequestState
          isEmpty
          icon="inbox"
          title={
            myOnly
              ? 'لا توجد طلبات بعد — اضغط "اطلب تبرعاً"'
              : "لا توجد طلبات حالياً"
          }
          description="جرّب تغيير التصنيف أو المنطقة، أو أنشئ طلباً جديداً."
          className="border-dashed"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => (
            <DonationRequestCard
              key={request._id}
              request={request}
              myOnly={myOnly}
              currentUserId={currentUserId}
              canceling={cancelingId === request._id}
              onOpenDetails={onOpenDetails}
              onOffer={onOffer}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}

      <PaginationControls
        page={page}
        totalPages={pages}
        onPageChange={onPageChange}
        mode="compact"
        disabled={loading}
        className="pt-4"
      />
    </section>
  );
}
