"use client";

import { useParams, useRouter } from "next/navigation";
import ItemEditorForm from "@/components/items/ItemEditorForm";
import PageIntro from "@/components/ui/PageIntro";
import { useSettings } from "@/hooks/useSettings";
import { useEditItem } from "./hooks/useEditItem";

export default function EditItemClient() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const { settings, categories, isLoading: settingsLoading } = useSettings();
  const hubRequired = settings?.requireHubForBooking ?? false;
  const editor = useEditItem(itemId, hubRequired);

  if (editor.fetching) {
    return <div className="flex min-h-dvh items-center justify-center bg-surface"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
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
          actions={<button type="button" onClick={() => router.back()} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black text-white hover:bg-white/16">إلغاء والعودة</button>}
          meta={<><span className="data-chip"><span className="material-symbols-outlined text-[15px]">image</span>صورة واحدة واضحة</span><span className="data-chip"><span className="material-symbols-outlined text-[15px]">location_on</span>نقطة تسليم آمنة</span></>}
        />
        <ItemEditorForm
          mode="edit"
          formData={editor.formData}
          preview={editor.preview}
          categories={categories}
          settingsLoading={settingsLoading}
          hubRequired={hubRequired}
          loading={editor.loading}
          message={editor.message}
          onChange={editor.handleChange}
          onImageChange={editor.handleImageChange}
          onHubChange={editor.handleHubChange}
          onSubmit={editor.handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
