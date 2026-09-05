"use client";

import { useRouter } from "next/navigation";
import ItemEditorForm from "@/components/items/ItemEditorForm";
import PageIntro from "@/components/ui/PageIntro";
import { useSettings } from "@/hooks/useSettings";
import { useAddItem } from "./hooks/useAddItem";

export default function AddItemClient() {
  const router = useRouter();
  const { settings, categories, isLoading: settingsLoading } = useSettings();
  const hubRequired = settings?.requireHubForBooking ?? false;
  const editor = useAddItem(hubRequired);

  return (
    <div className="page-shell pb-20 pt-20 md:pb-28" dir="rtl">
      <div className="site-container max-w-4xl space-y-6 font-body md:pt-4">
        <PageIntro
          eyebrow="تبرع عيني · خطوة واحدة"
          title="أضف غرضًا ليستفيد منه غيرك"
          description="صورة حقيقية ووصف دقيق يسرّعان الوصول إلى المستفيد المناسب ويقللان الأسئلة قبل الحجز."
          icon="add_box"
          meta={<><span className="data-chip">صورة JPG أو PNG أو WebP</span><span className="data-chip">وصف واضح لحالة الغرض</span><span className="data-chip">تسليم منظم عبر مركز آمن</span></>}
        />
        <ItemEditorForm
          mode="create"
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
