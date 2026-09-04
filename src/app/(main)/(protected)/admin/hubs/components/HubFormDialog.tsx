"use client";

import type { Dispatch, SetStateAction } from "react";
import AccessibleDialog from "@/components/ui/AccessibleDialog";
import type { HubFormState, HubModalState } from "../hooks/useAdminHubs";

type HubFormDialogProps = {
  modal: HubModalState;
  form: HubFormState;
  formBusy: boolean;
  formErrors: string[];
  availableCities: string[];
  setForm: Dispatch<SetStateAction<HubFormState>>;
  onSave: () => void;
  onClose: () => void;
};

const FIELD_CLASS =
  "w-full rounded-2xl border border-[#e5dfd6] bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition-all placeholder:text-[#b3aba1] focus:border-primary";

export default function HubFormDialog({
  modal,
  form,
  formBusy,
  formErrors,
  availableCities,
  setForm,
  onSave,
  onClose,
}: HubFormDialogProps) {
  if (modal === "closed") return null;
  const isAdd = modal === "add";

  return (
    <AccessibleDialog
      ariaLabel={isAdd ? "إضافة مركز جديد" : "تعديل المركز"}
      onClose={onClose}
      closeDisabled={formBusy}
      ariaBusy={formBusy}
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      panelClassName="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-[32px] border border-white/20 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-center justify-between border-b border-[#f0ebe4] px-6 py-5">
        <div>
          <h2 className="text-lg font-black text-[#1f312f]">
            {isAdd ? "إضافة مركز جديد" : "تعديل المركز"}
          </h2>
          <p className="mt-1 text-xs text-[#938b82]">
            أدخل بيانات المركز بدقة لتسهيل إدارته وربطه بالموقع
          </p>
        </div>
        <button
          type="button"
          aria-label="إغلاق نافذة المركز"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f1eb] text-[#6e6860] hover:bg-[#ece6de]"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="space-y-5 px-6 py-6">
        {formErrors.length > 0 && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4" role="alert">
            {formErrors.map((error) => (
              <p key={error} className="flex items-center gap-2 text-xs font-bold text-red-600">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </p>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-1.5 block text-xs font-black text-[#6c665f]">اسم المركز *</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="مثال: مركز الزرقاء الرئيسي"
              className={FIELD_CLASS}
            />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1.5 block text-xs font-black text-[#6c665f]">العنوان *</span>
            <input
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              placeholder="مثال: شارع الملكة نور، بناية رقم 5"
              className={FIELD_CLASS}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-black text-[#6c665f]">المدينة *</span>
            <input
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              placeholder="مثال: عمان"
              list="cities-datalist"
              className={FIELD_CLASS}
            />
            <datalist id="cities-datalist">
              {availableCities.map((city) => <option key={city} value={city} />)}
            </datalist>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-black text-[#6c665f]">ساعات العمل</span>
            <input
              value={form.workingHours}
              onChange={(event) => setForm((current) => ({ ...current, workingHours: event.target.value }))}
              placeholder="9:00 ص — 5:00 م"
              className={FIELD_CLASS}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-black text-[#6c665f]">خط العرض (Lat)</span>
            <input
              type="number"
              min="-90"
              max="90"
              step="any"
              value={form.lat}
              onChange={(event) => setForm((current) => ({ ...current, lat: event.target.value }))}
              placeholder="31.9539"
              className={FIELD_CLASS}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-black text-[#6c665f]">خط الطول (Lng)</span>
            <input
              type="number"
              min="-180"
              max="180"
              step="any"
              value={form.lng}
              onChange={(event) => setForm((current) => ({ ...current, lng: event.target.value }))}
              placeholder="35.9106"
              className={FIELD_CLASS}
            />
          </label>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#e2ddd5] py-3 text-sm font-black text-[#66615b] hover:bg-[#faf8f4]"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={formBusy}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {formBusy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                جاري الحفظ...
              </>
            ) : isAdd ? "إضافة المركز" : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </AccessibleDialog>
  );
}
