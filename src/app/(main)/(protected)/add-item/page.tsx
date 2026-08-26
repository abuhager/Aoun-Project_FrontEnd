"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { HubSelector } from "@/components/HubSelector";
import { useAddItem } from "./hooks/useAddItem";
import { useSettings } from "@/hooks/useSettings";

const CONDITIONS = ["جديد", "مستعمل ممتاز", "مستعمل جيد"] as const;
const CITIES = ["عمان", "إربد", "الزرقاء", "العقبة"] as const;

export default function AddItemPage() {
  const router = useRouter();
  const { settings, categories, isLoading: settingsLoading } = useSettings();
  const hubRequired = settings?.requireHubForBooking ?? false;

  const {
    formData,
    preview,
    loading,
    message,
    handleChange,
    handleImageChange,
    handleSubmit,
    handleHubChange,
  } = useAddItem(hubRequired);

  return (
    <div className="page-shell pb-20 md:pb-28" dir="rtl">
      <div className="site-container max-w-3xl pt-24 font-body md:pt-28">
        <div className="mb-7 border-b border-black/[0.06] pb-6">
          <span className="eyebrow">
            <span className="material-symbols-outlined text-[15px]">volunteer_activism</span>
            تبرع عيني
          </span>
          <h1 className="mt-4 text-3xl font-black text-on-surface md:text-4xl">
            إضافة تبرع جديد
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-on-surface-variant md:text-base">
            أضف صورة واضحة وتفاصيل دقيقة لتسهّل على المستفيد اتخاذ القرار والتنسيق معك.
          </p>
        </div>

        <div className="surface-card p-5 sm:p-7 md:p-9">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="relative group">
              <label htmlFor="item-image" className="mb-2 block text-xs font-black text-on-surface-variant md:text-sm">
                صورة الغرض
              </label>

              <div
                className={`flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 transition-all md:p-10 ${
                  preview
                    ? "border-primary bg-primary-softer"
                    : "border-outline-variant bg-surface-container-low hover:border-primary/35 hover:bg-primary-softer"
                }`}
              >
                {preview ? (
                  <div className="relative w-full h-40 md:h-48">
                    <Image
                      src={preview}
                      alt="معاينة صورة الغرض"
                      fill
                      className="object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl md:text-5xl text-primary/60 mb-3 md:mb-4">
                      cloud_upload
                    </span>
                    <p className="mb-1 text-sm font-black text-on-surface md:text-base">
                      اسحب الصورة هنا أو اضغط للرفع
                    </p>
                    <p id="item-image-hint" className="text-[10px] text-on-surface-soft md:text-xs">
                      يدعم JPEG وPNG وWebP (حد أقصى 5MB)
                    </p>
                  </>
                )}

                <input
                  id="item-image"
                  required
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  aria-describedby={preview ? undefined : "item-image-hint"}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:gap-6">
              <div className="space-y-2">
                <label htmlFor="item-title" className="block text-xs font-black text-on-surface-variant md:text-sm">اسم الغرض</label>
                <input
                  id="item-title"
                  required
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="مثال: لابتوب ديل مستعمل"
                  className="field-control px-4 py-3 text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70 md:px-5 md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <label htmlFor="item-category" className="block text-xs font-black text-on-surface-variant md:text-sm">التصنيف</label>

                  <div className="relative">
                    <select
                      id="item-category"
                      required
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={settingsLoading || categories.length === 0}
                      className="field-control appearance-none px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 md:px-5 md:text-base"
                    >
                      <option value="" disabled>
                        {settingsLoading ? "جاري تحميل التصنيفات..." : "اختر التصنيف"}
                      </option>

                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                      expand_more
                    </span>
                  </div>

                  {!settingsLoading && categories.length === 0 && (
                    <p className="text-xs text-red-600 font-medium">
                      لا توجد تصنيفات متاحة حالياً من لوحة الإدارة.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="item-location" className="block text-xs font-black text-on-surface-variant md:text-sm">المدينة</label>

                  <div className="relative">
                    <select
                      id="item-location"
                      required
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="field-control appearance-none px-4 py-3 text-sm font-bold md:px-5 md:text-base"
                    >
                      <option value="" disabled>
                        اختر المدينة
                      </option>

                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>

                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                      location_on
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-black text-on-surface-variant md:text-sm">حالة الغرض</span>

                <div className="flex flex-wrap gap-2 md:gap-3">
                  {CONDITIONS.map((cond) => (
                    <label key={cond} className="flex-1 min-w-25 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        value={cond}
                        onChange={handleChange}
                        checked={formData.condition === cond}
                        className="peer sr-only"
                      />
                      <div className="rounded-xl border border-transparent bg-surface-container-low px-3 py-2.5 text-center text-xs font-bold text-on-surface-variant transition-all hover:bg-surface-container-high peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-checked:border-primary/20 peer-checked:bg-primary-soft peer-checked:text-primary-container md:px-4 md:py-3 md:text-sm">
                        {cond}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="item-description" className="block text-xs font-black text-on-surface-variant md:text-sm">الوصف التفصيلي</label>
                <textarea
                  id="item-description"
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="اكتب تفاصيل إضافية عن القطعة..."
                  rows={4}
                  className="field-control resize-none px-4 py-3 text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70 md:px-5 md:text-base"
                />
              </div>
            </div>

            <HubSelector
              value={formData.hubId}
              onChange={handleHubChange}
              required={hubRequired}
            />

            {message.text && (
              <div
                role={message.type === "success" ? "status" : "alert"}
                aria-live={message.type === "success" ? "polite" : "assertive"}
                className={`rounded-xl p-4 text-center text-sm font-bold md:text-base ${
                  message.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse md:gap-4 md:pt-4">
              <button
                type="submit"
                disabled={loading || settingsLoading || categories.length === 0}
                className="btn-primary flex-1 py-3.5 text-sm md:text-base"
              >
                <span>{loading ? "جاري النشر..." : "انشر التبرع الآن"}</span>
                <span className="material-symbols-outlined text-lg md:text-xl">
                  send
                </span>
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1 py-3.5 text-sm md:text-base"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
