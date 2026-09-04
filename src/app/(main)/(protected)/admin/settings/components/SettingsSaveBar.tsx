"use client";

export function SettingsSaveBar({
  canEdit,
  changedCount,
  dirty,
  saving,
  onSave,
}: {
  canEdit: boolean;
  changedCount: number;
  dirty: boolean;
  saving: boolean;
  onSave: () => void | Promise<void>;
}) {
  return (
    <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-24px)] max-w-3xl -translate-x-1/2">
      <div className="flex items-center justify-between gap-3 rounded-[24px] border border-[#e7e1d8] bg-white/95 px-4 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="min-w-0">
          <p className="text-sm font-black text-[#1f312f]">
            {dirty
              ? `${changedCount} تغيير/تغييرات بانتظار الحفظ`
              : "لا توجد تغييرات جديدة"}
          </p>
          <p className="mt-0.5 text-xs text-[#8c857d]">
            احفظ التغييرات لتطبيق القواعد الحالية على المنصة.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving || !dirty || !canEdit}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined animate-spin text-sm">
                progress_activity
              </span>
              جارٍ الحفظ...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">save</span>
              حفظ الإعدادات
            </>
          )}
        </button>
      </div>
    </div>
  );
}
