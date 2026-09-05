"use client";

import Image from "next/image";
import { HubSelector } from "@/components/HubSelector";
import { ITEM_CITIES, ITEM_CONDITIONS } from "./itemEditorOptions";
import type {
  ItemEditorMessage,
  ItemEditorValues,
  ItemFieldChangeHandler,
  ItemImageChangeHandler,
  ItemSubmitHandler,
} from "./itemEditor.types";

interface ItemEditorFormProps {
  mode: "create" | "edit";
  formData: ItemEditorValues;
  preview: string | null;
  categories: string[];
  settingsLoading: boolean;
  hubRequired: boolean;
  loading: boolean;
  message: ItemEditorMessage;
  onChange: ItemFieldChangeHandler;
  onImageChange: ItemImageChangeHandler;
  onHubChange: (hubId: string) => void;
  onSubmit: ItemSubmitHandler;
  onCancel: () => void;
}

export default function ItemEditorForm({
  mode,
  formData,
  preview,
  categories,
  settingsLoading,
  hubRequired,
  loading,
  message,
  onChange,
  onImageChange,
  onHubChange,
  onSubmit,
  onCancel,
}: ItemEditorFormProps) {
  const isCreate = mode === "create";
  const prefix = isCreate ? "item" : "edit-item";

  return (
    <div className={`content-panel overflow-hidden ${isCreate ? "p-5 sm:p-7 md:p-9" : "mx-auto max-w-4xl"}`}>
      {!isCreate && (
        <div className="border-b border-black/[0.06] px-6 py-5 md:px-8">
          <span className="section-kicker">ITEM DETAILS</span>
          <h2 className="mt-1 text-lg font-black">المعلومات الظاهرة للمستفيدين</h2>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6 md:space-y-8">
        <div className={isCreate ? "relative group" : "relative p-6 pb-0 md:p-8 md:pb-0"}>
          <label htmlFor={`${prefix}-image`} className="mb-2 block text-xs font-black text-on-surface-variant md:text-sm">
            صورة الغرض
            {!isCreate && <span className="mr-1 font-normal text-on-surface-variant">(اختياري — إذا لم تختر ستبقى الصورة الحالية)</span>}
          </label>
          <div className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[18px] border-2 border-dashed p-6 transition-all md:p-10 ${preview ? "border-primary bg-primary-softer" : "border-outline-variant bg-surface-container-low hover:border-primary/35 hover:bg-primary-softer"}`}>
            {preview ? (
              <div className="relative h-40 w-full md:h-48"><Image src={preview} alt={isCreate ? "معاينة صورة الغرض" : "معاينة"} fill sizes="(max-width: 768px) 100vw, 50vw" className="rounded-xl object-contain" /></div>
            ) : (
              <><span className="material-symbols-outlined mb-3 text-4xl text-primary/60 md:mb-4 md:text-5xl">cloud_upload</span><p className="mb-1 text-sm font-black text-on-surface md:text-base">اسحب الصورة هنا أو اضغط للرفع</p><p id={`${prefix}-image-hint`} className="text-[10px] text-on-surface-soft md:text-xs">يدعم JPEG وPNG وWebP (حد أقصى 5MB)</p></>
            )}
            <input id={`${prefix}-image`} required={isCreate} type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} aria-describedby={preview ? undefined : `${prefix}-image-hint`} className="absolute inset-0 cursor-pointer opacity-0" />
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-5 md:gap-6 ${isCreate ? "" : "px-6 md:px-8"}`}>
          <div className="space-y-2"><label htmlFor={`${prefix}-title`} className="block text-xs font-black text-on-surface-variant md:text-sm">اسم الغرض</label><input id={`${prefix}-title`} required name="title" type="text" value={formData.title} onChange={onChange} placeholder="مثال: لابتوب ديل مستعمل" className="field-control px-4 py-3 text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70 md:px-5 md:text-base" /></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <div className="space-y-2"><label htmlFor={`${prefix}-category`} className="block text-xs font-black text-on-surface-variant md:text-sm">التصنيف</label><div className="relative"><select id={`${prefix}-category`} required name="category" value={formData.category} onChange={onChange} disabled={settingsLoading || categories.length === 0} className="field-control w-full appearance-none px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 md:px-5 md:text-base"><option value="" disabled>{settingsLoading ? "جاري تحميل التصنيفات..." : "اختر التصنيف"}</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline">expand_more</span></div>{!settingsLoading && categories.length === 0 && <p className="text-xs font-medium text-red-600">لا توجد تصنيفات متاحة حالياً من لوحة الإدارة.</p>}</div>
            <div className="space-y-2"><label htmlFor={`${prefix}-location`} className="block text-xs font-black text-on-surface-variant md:text-sm">المدينة</label><div className="relative"><select id={`${prefix}-location`} required name="location" value={formData.location} onChange={onChange} className="field-control w-full appearance-none px-4 py-3 text-sm font-bold md:px-5 md:text-base"><option value="" disabled>اختر المدينة</option>{ITEM_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}</select><span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline">location_on</span></div></div>
          </div>
          <div className="space-y-2"><span className="block text-xs font-black text-on-surface-variant md:text-sm">حالة الغرض</span><div className="flex flex-wrap gap-2 md:gap-3">{ITEM_CONDITIONS.map((condition) => <label key={condition} className="min-w-25 flex-1 cursor-pointer"><input type="radio" name="condition" value={condition} onChange={onChange} checked={formData.condition === condition} className="peer sr-only" /><div className="rounded-xl border border-transparent bg-surface-container-low px-3 py-2.5 text-center text-xs font-bold text-on-surface-variant transition-all hover:bg-surface-container-high peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-checked:border-primary/20 peer-checked:bg-primary-soft peer-checked:text-primary-container md:px-4 md:py-3 md:text-sm">{condition}</div></label>)}</div></div>
          <div className="space-y-2"><label htmlFor={`${prefix}-description`} className="block text-xs font-black text-on-surface-variant md:text-sm">الوصف التفصيلي</label><textarea id={`${prefix}-description`} required name="description" value={formData.description} onChange={onChange} placeholder="اكتب تفاصيل إضافية عن القطعة..." rows={4} className="field-control min-h-32 resize-none px-4 py-3 text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70 md:px-5 md:text-base" /></div>
        </div>

        <div className={isCreate ? "" : "px-6 md:px-8"}><HubSelector value={formData.hubId} onChange={onHubChange} required={hubRequired} /></div>
        {message.text && <div role={message.type === "success" ? "status" : "alert"} aria-live={message.type === "success" ? "polite" : "assertive"} className={`${isCreate ? "" : "mx-6 md:mx-8"} rounded-xl p-4 text-center text-sm font-bold md:text-base ${message.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{message.text}</div>}
        <div className={`flex flex-col gap-3 sm:flex-row-reverse md:gap-4 ${isCreate ? "pt-2 md:pt-4" : "border-t border-black/[0.06] bg-surface-container-low/60 p-6 md:p-8"}`}>
          <button type="submit" disabled={loading || settingsLoading || categories.length === 0} className={`btn-primary flex-1 text-sm md:text-base ${isCreate ? "py-3.5" : "rounded-xl px-6 py-3 md:px-8 md:py-4"}`}><span>{loading ? (isCreate ? "جاري النشر..." : "جاري الحفظ...") : (isCreate ? "انشر التبرع الآن" : "حفظ التعديلات")}</span><span className="material-symbols-outlined text-lg md:text-xl">{isCreate ? "send" : "save"}</span></button>
          <button type="button" onClick={onCancel} className={`btn-secondary flex-1 text-sm md:text-base ${isCreate ? "py-3.5" : "rounded-xl px-6 py-3 md:px-8 md:py-4"}`}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}
