"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { HubSelector } from "@/components/HubSelector";
import { useEditItem } from "./hooks/useEditItem";
import { useSettings } from "@/hooks/useSettings";
import PageIntro from "@/components/ui/PageIntro";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const { settings, categories, isLoading: settingsLoading } = useSettings();
  const hubRequired = settings?.requireHubForBooking ?? false;

  const {
    formData,
    preview,
    loading,
    fetching,
    message,
    handleChange,
    handleImageChange,
    handleSubmit,
    handleHubChange,
    CONDITIONS,
    CITIES,
  } = useEditItem(itemId, hubRequired);

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-dvh bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-shell pb-20 pt-20" dir="rtl">
      <div className="site-container space-y-6 font-body md:pt-4">
        <PageIntro
          eyebrow="إدارة التبرع"
          title="تعديل بيانات الغرض"
          description="حدّث الصورة أو الوصف أو نقطة التسليم. تبقى حالة الحجز والتسليم محفوظة كما هي."
          icon="edit_note"
          tone="ink"
          actions={
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black text-white hover:bg-white/16"
            >
              إلغاء والعودة
            </button>
          }
          meta={
            <>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">image</span>
                صورة واحدة واضحة
              </span>
              <span className="data-chip">
                <span className="material-symbols-outlined text-[15px]">location_on</span>
                نقطة تسليم آمنة
              </span>
            </>
          }
        />

        <div className="content-panel mx-auto max-w-4xl overflow-hidden">
          <div className="border-b border-black/[0.06] px-6 py-5 md:px-8">
            <span className="section-kicker">ITEM DETAILS</span>
            <h2 className="mt-1 text-lg font-black">المعلومات الظاهرة للمستفيدين</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="relative p-6 pb-0 md:p-8 md:pb-0">
              <label className="block mb-2 font-bold text-xs md:text-sm">
                صورة الغرض
                <span className="text-on-surface-variant font-normal mr-1">
                  (اختياري — إذا لم تختر ستبقى الصورة الحالية)
                </span>
              </label>

              <div
                className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[18px] border-2 border-dashed p-6 transition-all md:p-10 ${
                  preview
                    ? "border-primary bg-emerald-50"
                    : "border-outline-variant bg-surface-container-low hover:bg-[#edeeef]"
                }`}
              >
                {preview ? (
                  <div className="relative w-full h-40 md:h-48">
                    <Image
                      src={preview}
                      alt="معاينة"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl md:text-5xl text-primary/60 mb-3">
                      cloud_upload
                    </span>
                    <p className="font-medium text-sm md:text-base mb-1">
                      اسحب الصورة هنا أو اضغط للرفع
                    </p>
                    <p className="text-on-surface-variant text-[10px] md:text-xs italic">
                      يدعم JPEG وPNG وWebP (حد أقصى 5MB)
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 px-6 md:gap-6 md:px-8">
              <div className="space-y-2">
                <label className="block font-bold text-xs md:text-sm mr-1">اسم الغرض</label>
                <input
                  required
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="مثال: لابتوب ديل مستعمل"
                  className="field-control bg-white px-4 py-3 text-sm placeholder:text-outline md:px-5 md:py-4 md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <label className="block font-bold text-xs md:text-sm mr-1">التصنيف</label>
                  <div className="relative">
                    <select
                      required
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={settingsLoading || categories.length === 0}
                      className="field-control w-full appearance-none px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 md:px-5 md:py-4 md:text-base"
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
                  <label className="block font-bold text-xs md:text-sm mr-1">المدينة</label>
                  <div className="relative">
                    <select
                      required
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="field-control w-full appearance-none px-4 py-3 text-sm md:px-5 md:py-4 md:text-base"
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
                <label className="block font-bold text-xs md:text-sm mr-1">حالة الغرض</label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {CONDITIONS.map((cond) => (
                    <label key={cond} className="flex-1 min-w-25 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        value={cond}
                        onChange={handleChange}
                        checked={formData.condition === cond}
                        className="hidden peer"
                      />
                      <div className="bg-surface-container-low peer-checked:bg-[#98f994] peer-checked:text-[#002204] text-on-surface-variant px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-center transition-all text-xs md:text-sm font-medium hover:bg-surface-container-highest">
                        {cond}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-xs md:text-sm mr-1">الوصف التفصيلي</label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="اكتب تفاصيل إضافية عن القطعة..."
                  rows={4}
                  className="field-control min-h-32 resize-none px-4 py-3 text-sm placeholder:text-outline md:px-5 md:py-4 md:text-base"
                />
              </div>
            </div>

            <div className="px-6 md:px-8">
              <HubSelector
                value={formData.hubId}
                onChange={handleHubChange}
                required={hubRequired}
              />
            </div>

            {message.text && (
              <div
                role={message.type === "success" ? "status" : "alert"}
                className={`mx-6 rounded-xl p-4 text-center text-sm font-bold md:mx-8 md:text-base ${
                  message.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-black/[0.06] bg-surface-container-low/60 p-6 sm:flex-row-reverse md:gap-4 md:p-8">
              <button
                type="submit"
                disabled={loading || settingsLoading || categories.length === 0}
                className="btn-primary flex-1 rounded-xl px-6 py-3 text-sm md:px-8 md:py-4 md:text-base"
              >
                <span>{loading ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
                <span className="material-symbols-outlined text-lg md:text-xl">save</span>
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1 rounded-xl px-6 py-3 text-sm md:px-8 md:py-4 md:text-base"
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
