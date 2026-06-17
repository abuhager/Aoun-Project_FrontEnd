import { Suspense } from "react";
import DonationRequestsClient from "./DonationRequestsClient";

export default function DonationRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface min-h-screen pb-24 text-[#191c1d]" dir="rtl">
          <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto">
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </main>
        </div>
      }
    >
      <DonationRequestsClient />
    </Suspense>
  );
}