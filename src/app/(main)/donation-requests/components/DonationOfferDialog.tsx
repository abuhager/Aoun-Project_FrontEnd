import Image from "next/image";
import type { ChangeEvent } from "react";
import AccessibleDialog from "@/components/ui/AccessibleDialog";
import type { DonationRequest } from "@/types/donationRequest.types";
import type { SafeHub } from "@/types/hub.types";
import {
  DONATION_OFFER_CONDITIONS,
  type DonationOfferForm,
} from "../hooks/useDonationRequests";

type DonationOfferDialogProps = {
  request: DonationRequest | null;
  form: DonationOfferForm;
  hubs: SafeHub[];
  requireHub: boolean;
  imagePreview: string | null;
  submitting: boolean;
  onChange: (patch: Partial<DonationOfferForm>) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function DonationOfferDialog({
  request,
  form,
  hubs,
  requireHub,
  imagePreview,
  submitting,
  onChange,
  onImageChange,
  onRemoveImage,
  onSubmit,
  onClose,
}: DonationOfferDialogProps) {
  if (!request) return null;

  return (
    <AccessibleDialog
      ariaLabel={`الاستجابة لطلب ${request.title}`}
      onClose={onClose}
      closeDisabled={submitting}
      ariaBusy={submitting}
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
      panelClassName="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[30px] border border-black/5 bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.22)] sm:p-6 md:p-7"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ecf8f6] px-3 py-1 text-[10px] font-black text-primary">
            <span className="material-symbols-outlined text-[13px]">volunteer_activism</span>
            إنشاء عرض مرتبط بالطلب
          </div>
          <h2 className="mt-3 text-base font-black text-[#1d2324] md:text-lg">
            الاستجابة لطلب: {request.title}
          </h2>
          <p className="mt-1 text-xs leading-6 text-[#7a736b]">
            سيصل عرضك لصاحب الطلب أولاً. إذا اختارك، سيُنشأ الغرض ويُحجز له
            تلقائياً عند نقطة التسليم الآمنة.
          </p>
        </div>

        <button
          type="button"
          aria-label="إغلاق نافذة الاستجابة"
          onClick={onClose}
          disabled={submitting}
          className="text-gray-400 transition-colors hover:text-gray-600"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="offer-condition" className="mb-1.5 block text-xs font-black text-[#4b4640]">
            حالة الغرض
          </label>
          <select
            id="offer-condition"
            value={form.condition}
            onChange={(event) =>
              onChange({
                condition: event.target.value as DonationOfferForm["condition"],
              })
            }
            className="w-full rounded-2xl border border-[#e4dfd7] bg-[#fcfbf8] px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
          >
            {DONATION_OFFER_CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="offer-description" className="mb-1.5 block text-xs font-black text-[#4b4640]">
            وصف الغرض
            <span className="mr-1 font-normal text-gray-400">(اختياري)</span>
          </label>
          <textarea
            id="offer-description"
            value={form.description}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="مثلاً: كتاب رياضيات صف عاشر، حالة ممتازة، لم يُستخدم كثيراً..."
            rows={4}
            maxLength={500}
            className="w-full resize-none rounded-2xl border border-[#e4dfd7] bg-[#fcfbf8] px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
          />
          <p className="mt-1 text-left text-[10px] text-gray-400">
            {form.description.length}/500
          </p>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-black text-[#4b4640]">
            صورة الغرض
            <span className="mr-1 font-normal text-gray-400">(اختيارية)</span>
          </span>

          <label className="relative flex h-32 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#ddd7cf] bg-[#fcfbf8] transition-colors hover:border-primary/40 hover:bg-primary/[0.03]">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="معاينة الصورة"
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 512px"
                  className="rounded-2xl object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs font-black text-white opacity-0 transition-opacity hover:opacity-100">
                  تغيير الصورة
                </span>
              </>
            ) : (
              <span className="flex flex-col items-center gap-1 text-gray-400">
                <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                <span className="text-xs font-bold">اضغط لإضافة صورة</span>
                <span className="text-[10px]">JPG, PNG, WebP — بحد أقصى 5MB</span>
              </span>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onImageChange}
            />
          </label>

          {form.imageFile && (
            <button
              type="button"
              onClick={onRemoveImage}
              className="mt-1 text-[10px] font-bold text-red-500 transition-colors hover:text-red-700"
            >
              ✕ إزالة الصورة
            </button>
          )}
        </div>

        <div>
          <label htmlFor="offer-hub" className="mb-1.5 block text-xs font-black text-[#4b4640]">
            نقطة التسليم الآمنة {requireHub ? "*" : "(اختيارية)"}
          </label>

          {hubs.length === 0 ? (
            <div className="w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-bold text-orange-600">
              {requireHub
                ? "⚠️ لا توجد نقاط تسليم متاحة — تواصل مع الإدارة"
                : "لا توجد نقاط تسليم متاحة حالياً؛ يمكنك متابعة العرض والاتفاق مباشرةً."}
            </div>
          ) : (
            <select
              id="offer-hub"
              value={form.safeHub}
              onChange={(event) => onChange({ safeHub: event.target.value })}
              className="w-full rounded-2xl border border-[#e4dfd7] bg-[#fcfbf8] px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
            >
              <option value="">اختر نقطة...</option>
              {hubs.map((hub) => (
                <option key={hub._id} value={hub._id}>
                  {hub.name} — {hub.city}
                </option>
              ))}
            </select>
          )}
        </div>

        {form.safeHub && (
          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-3 text-xs font-bold text-primary">
            ✅ سيبقى العرض معلّقاً حتى يراجعه صاحب الطلب ويختار المتبرع
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || (requireHub && !form.safeHub)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                جاري الإرسال...
              </>
            ) : (
              "تأكيد التبرع 🎁"
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-2xl bg-[#f0ece5] px-5 py-3 text-sm font-black text-[#6b655e] transition-colors hover:bg-[#e5dfd6] disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </AccessibleDialog>
  );
}
