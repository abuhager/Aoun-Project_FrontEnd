"use client";

import PaginationControls from "@/components/ui/PaginationControls";
import AdminItemsTable from "./components/AdminItemsTable";
import DeleteItemDialog from "./components/DeleteItemDialog";
import { useAdminItems } from "./hooks/useAdminItems";

export default function AdminItemsPage() {
  const {
    busy,
    closeDelete,
    confirmDelete,
    deleteNote,
    getImage,
    items,
    loading,
    openDelete,
    page,
    pages,
    pendingDelete,
    setDeleteNote,
    setPage,
    toast,
  } = useAdminItems();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast */}
      {toast && (
        <div
          role={toast.ok ? "status" : "alert"}
          aria-live={toast.ok ? "polite" : "assertive"}
          aria-atomic="true"
          className={`fixed left-1/2 top-20 z-[60] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl px-6 py-3 text-center text-sm font-black text-white shadow-[0_20px_40px_rgba(15,23,42,0.16)] transition-all ${
            toast.ok ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <DeleteItemDialog
        item={pendingDelete}
        note={deleteNote}
        busy={Boolean(pendingDelete && busy[pendingDelete.id])}
        onNoteChange={setDeleteNote}
        onConfirm={confirmDelete}
        onClose={closeDelete}
      />

      {/* Header */}
      <section className="admin-page-hero rounded-[30px] border border-[#e7e1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f4ee_100%)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-extrabold text-primary">
              <span className="material-symbols-outlined text-[15px]">
                inventory_2
              </span>
              إدارة الأغراض
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#1f312f]">
              الأغراض
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7a746d]">
              مراجعة العناصر المنشورة، التحقق من أصحابها، ومتابعة حالتها من واجهة
              مرتبة ومناسبة للإدارة اليومية.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { icon: "inventory", label: "إدارة مباشرة" },
              { icon: "image", label: "معاينة أوضح" },
              { icon: "schedule", label: "متابعة زمنية" },
            ].map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#ece6de] bg-white px-3.5 py-2 text-xs font-bold text-[#5f5a54] shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {item.icon}
                </span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdminItemsTable
        items={items}
        loading={loading}
        busy={busy}
        page={page}
        pages={pages}
        getImage={getImage}
        onDelete={openDelete}
      />

      {/* Pagination */}
      <PaginationControls
        page={page}
        totalPages={pages}
        onPageChange={setPage}
      />
    </div>
  );
}
