import { Suspense } from "react";
import DonationRequestsClient from "./DonationRequestsClient";

function RequestsPageSkeleton() {
  return (
    <div
      className="min-h-dvh bg-[#f7f6f2] pb-24 text-[#191c1d]"
      dir="rtl"
    >
      <div className="mx-auto max-w-6xl px-4 pt-20 md:px-8 md:pt-24">
        {/* Header skeleton */}
        <section className="mb-8">
          <div className="h-3 w-28 animate-pulse rounded-full bg-[#e9e4dc]" />
          <div className="mt-4 h-8 w-56 animate-pulse rounded-2xl bg-[#e3ddd4]" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-full bg-[#eee9e1]" />
        </section>

        {/* Controls skeleton */}
        <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <div className="h-10 w-28 animate-pulse rounded-full bg-white shadow-sm" />
            <div className="h-10 w-24 animate-pulse rounded-full bg-white shadow-sm" />
            <div className="h-10 w-24 animate-pulse rounded-full bg-white shadow-sm" />
          </div>

          <div className="h-10 w-full max-w-xs animate-pulse rounded-2xl bg-white shadow-sm" />
        </section>

        {/* Bento / cards skeleton */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-sm"
            >
              <div className="h-44 animate-pulse bg-[#ece7df]" />

              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-[#f0ebe5]" />
                  <div className="h-5 w-14 animate-pulse rounded-full bg-[#f0ebe5]" />
                </div>

                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#e6e1d9]" />
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#eee9e1]" />
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded-full bg-[#f1ece5]" />
                  <div className="h-3 w-5/6 animate-pulse rounded-full bg-[#f1ece5]" />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-[#ece7df]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 animate-pulse rounded-full bg-[#ece7df]" />
                    <div className="h-2.5 w-20 animate-pulse rounded-full bg-[#f3efe9]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="h-10 animate-pulse rounded-2xl bg-[#f5f2ec]" />
                  <div className="h-10 animate-pulse rounded-2xl bg-[#e8f5f3]" />
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default function DonationRequestsPage() {
  return (
    <Suspense fallback={<RequestsPageSkeleton />}>
      <DonationRequestsClient />
    </Suspense>
  );
}