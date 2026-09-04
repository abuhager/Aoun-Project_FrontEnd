import Image from "next/image";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import type { AdminUser } from "@/types/admin.types";
import type { AdminUserAction } from "../hooks/useAdminUsers";

type AdminUsersTableProps = {
  users: AdminUser[];
  loading: boolean;
  busy: Record<string, boolean>;
  getAvatar: (url?: string) => string | null;
  onAction: (user: AdminUser, action: AdminUserAction) => void;
};

export default function AdminUsersTable({
  users,
  loading,
  busy,
  getAvatar,
  onAction,
}: AdminUsersTableProps) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-[#f0ebe4] bg-[#faf8f4] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-black text-[#233433]">قائمة المستخدمين</h2>
          <p className="mt-1 text-xs leading-6 text-[#8a837a]">
            راقب الثقة، التبرعات، حالة الحظر، ثم نفّذ الإجراء من نفس الصف.
          </p>
        </div>

        <div className="rounded-full border border-[#e9e3db] bg-white px-3 py-1 text-[11px] font-extrabold text-[#8e877f]">
          {users.length} مستخدم
        </div>
      </div>

      <ResponsiveTable label="جدول مستخدمي المنصة">
        <table className="min-w-[1120px] w-full text-sm">
          <thead className="bg-white">
            <tr className="border-b border-[#f0ebe4] text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a39b92]">
              <th className="p-4 text-right">المستخدم</th>
              <th className="p-4 text-right">نقاط الثقة</th>
              <th className="p-4 text-right">التبرعات</th>
              <th className="p-4 text-right">المستوى</th>
              <th className="p-4 text-right">الحالة</th>
              <th className="p-4 text-right">الإجراء الرئيسي</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-[#f5f1eb]">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="p-4">
                      <div className="h-4 animate-pulse rounded-full bg-[#f1ece5]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-[#b3aba1]">
                    <span className="material-symbols-outlined mb-3 text-5xl">
                      group_off
                    </span>
                    <p className="text-base font-black text-[#7b756d]">
                      لا يوجد مستخدمون
                    </p>
                    <p className="mt-1 text-sm text-[#a39b92]">
                      لم يتم العثور على نتائج مطابقة لعملية البحث الحالية.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const avatarUrl = getAvatar(u.avatar);
                const userId = u._id;

                return (
                  <tr
                    key={userId || `${u.email}-${u.name}`}
                    className="border-b border-[#f5f1eb] align-middle transition-colors hover:bg-[#fcfaf7]"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ece6de] bg-[#f2eee7]">
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt={u.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-[#a39b92]">
                              account_circle
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#223433]">
                            {u.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#9b948c]">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/5 px-3 py-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          shield
                        </span>
                        <span className="text-sm font-black text-primary">
                          {u.trustScore}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex rounded-2xl bg-[#f5f1eb] px-3 py-2 text-xs font-black text-[#5f5a54]">
                        {u.totalDonations} تبرع
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-xl px-3 py-1.5 text-[11px] font-black ${
                            u.trustLevel === 2
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          Level {u.trustLevel}
                        </span>

                        {u.trustLevel === 1 && (
                          <button
                            onClick={() => onAction(u, "promote")}
                            disabled={busy[userId]}
                            title="ترقية إلى Level 2"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-100 disabled:opacity-40"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              arrow_upward
                            </span>
                          </button>
                        )}

                        {u.trustLevel === 2 && (
                          <button
                            onClick={() => onAction(u, "demote")}
                            disabled={busy[userId]}
                            title="تخفيض إلى Level 1"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-100 disabled:opacity-40"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              arrow_downward
                            </span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-xl px-3 py-1.5 text-[11px] font-black ${
                          u.isBanned
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {u.isBanned ? "محظور" : "نشط"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onAction(u, u.isBanned ? "unban" : "ban")
                          }
                          disabled={busy[userId]}
                          className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all duration-300 disabled:opacity-40 ${
                            u.isBanned
                              ? "bg-green-50 text-green-600 hover:bg-green-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {busy[userId]
                            ? "..."
                            : u.isBanned
                            ? "فك الحظر"
                            : "حظر"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ResponsiveTable>
    </section>
  );
}
