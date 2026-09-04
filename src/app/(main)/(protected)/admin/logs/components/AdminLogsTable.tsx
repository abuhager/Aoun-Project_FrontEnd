import ResponsiveTable from "@/components/ui/ResponsiveTable";
import type {
  AdminAuditLog,
  AdminPersonReference,
} from "@/types/admin.types";

const ACTION_MAP: Record<string, { label: string; color: string; icon: string }> = {
  BAN: {
    label: "حظر مستخدم",
    color: "text-red-600 bg-red-50 border-red-100",
    icon: "block",
  },
  UNBAN: {
    label: "رفع الحظر",
    color: "text-green-600 bg-green-50 border-green-100",
    icon: "check_circle",
  },
  ITEM_HIDE: {
    label: "حذف/إخفاء غرض",
    color: "text-orange-600 bg-orange-50 border-orange-100",
    icon: "visibility_off",
  },
  PROMOTE: {
    label: "ترقية مستخدم",
    color: "text-blue-600 bg-blue-50 border-blue-100",
    icon: "arrow_upward",
  },
  DEMOTE: {
    label: "تخفيض مستخدم",
    color: "text-purple-600 bg-purple-50 border-purple-100",
    icon: "arrow_downward",
  },
  HUB_MANAGE: {
    label: "إدارة مركز",
    color: "text-cyan-600 bg-cyan-50 border-cyan-100",
    icon: "warehouse",
  },
  SETTINGS_UPDATE: {
    label: "تعديل إعدادات المنصة",
    color: "text-indigo-700 bg-indigo-50 border-indigo-100",
    icon: "tune",
  },
};

const REPORT_ACTION_MAP: Record<string, { label: string; color: string; icon: string }> = {
  "تحذير": {
    label: "تحذير على بلاغ",
    color: "text-yellow-700 bg-yellow-50 border-yellow-100",
    icon: "warning",
  },
  "حظر": {
    label: "حظر بسبب بلاغ",
    color: "text-red-600 bg-red-50 border-red-100",
    icon: "gavel",
  },
  "رفض البلاغ": {
    label: "رفض البلاغ",
    color: "text-gray-600 bg-gray-100 border-gray-200",
    icon: "cancel",
  },
};

function resolveAction(log: AdminAuditLog) {
  if (log.action === "REPORT_ACTION") {
    const subAction = log.meta?.action ?? "";
    return REPORT_ACTION_MAP[subAction] ?? {
      label: `إجراء على بلاغ${subAction ? ` (${subAction})` : ""}`,
      color: "text-yellow-700 bg-yellow-50 border-yellow-100",
      icon: "gavel",
    };
  }

  return ACTION_MAP[log.action] ?? {
    label: log.action,
    color: "text-gray-600 bg-gray-100 border-gray-200",
    icon: "info",
  };
}

function getPopulatedTarget(log: AdminAuditLog): AdminPersonReference | null {
  if (log.targetId && typeof log.targetId === "object") {
    return log.targetId;
  }
  return null;
}

function resolveTargetName(log: AdminAuditLog): string | null {
  if (log.meta?.targetName) return log.meta.targetName;

  const populated = getPopulatedTarget(log);
  if (populated?.name) return populated.name;
  if (populated?.title) return populated.title;
  return null;
}

function resolveTargetEmail(log: AdminAuditLog): string | null {
  if (log.meta?.targetEmail) return log.meta.targetEmail;

  const populated = getPopulatedTarget(log);
  if (populated?.email) return populated.email;

  return null;
}

function resolveReason(log: AdminAuditLog): string | null {
  return log.reason ?? log.meta?.reason ?? null;
}

function resolveAdminName(log: AdminAuditLog): string {
  return typeof log.adminId === "object" && log.adminId?.name
    ? log.adminId.name
    : "النظام";
}

const COL_COUNT = 6;

type AdminLogsTableProps = {
  logs: AdminAuditLog[];
  loading: boolean;
};

export default function AdminLogsTable({
  logs,
  loading,
}: AdminLogsTableProps) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-[#f0ebe4] bg-[#faf8f4] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-black text-[#233433]">سجل الأنشطة الإدارية</h2>
          <p className="mt-1 text-xs leading-6 text-[#8a837a]">
            كل صف يمثل حدثًا مستقلًا مع الفاعل، الإجراء، المستهدف، والسياق المرتبط به.
          </p>
        </div>

        <div className="rounded-full border border-[#e9e3db] bg-white px-3 py-1 text-[11px] font-extrabold text-[#8e877f]">
          {logs.length} سجل
        </div>
      </div>

      <ResponsiveTable label="جدول سجل العمليات الإدارية">
        <table className="min-w-[1180px] w-full text-sm">
          <thead className="bg-white">
            <tr className="border-b border-[#f0ebe4] text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#a39b92]">
              <th className="text-right p-4 whitespace-nowrap">الأدمن</th>
              <th className="text-right p-4 whitespace-nowrap">العملية</th>
              <th className="text-right p-4 whitespace-nowrap">المستهدف</th>
              <th className="text-right p-4 whitespace-nowrap">التفاصيل</th>
              <th className="text-right p-4 whitespace-nowrap">تعليق الأدمن</th>
              <th className="text-right p-4 whitespace-nowrap">التاريخ</th>
            </tr>
          </thead>

          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#f5f1eb]">
                    {Array.from({ length: COL_COUNT }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 rounded-full bg-[#f1ece5] animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : logs.length === 0 ? (
                  <tr>
                    <td colSpan={COL_COUNT} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-[#b3aba1]">
                        <span className="material-symbols-outlined mb-3 text-5xl">
                          history_toggle_off
                        </span>
                        <p className="text-base font-black text-[#7b756d]">
                          لا توجد سجلات حالياً
                        </p>
                        <p className="mt-1 text-sm text-[#a39b92]">
                          لم يتم العثور على أحداث ضمن الصفحة الحالية.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const action = resolveAction(log);
                    const targetName = resolveTargetName(log);
                    const targetEmail = resolveTargetEmail(log);
                    const reason = resolveReason(log);

                    return (
                      <tr
                        key={log._id}
                        className="border-b border-[#f5f1eb] align-top transition-colors hover:bg-[#fcfaf7]"
                      >
                        {/* Admin */}
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                              <span className="material-symbols-outlined text-primary text-[18px]">
                                shield_person
                              </span>
                            </div>
                            <div>
                              <p className="text-[13px] font-black text-[#223433] whitespace-nowrap">
                                {resolveAdminName(log)}
                              </p>
                              <p className="mt-0.5 text-[10px] font-bold tracking-[0.18em] text-[#b0a79d] uppercase">
                                Actor
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-black whitespace-nowrap ${action.color}`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {action.icon}
                            </span>
                            {action.label}
                          </span>
                        </td>

                        {/* Target */}
                        <td className="p-4">
                          {targetName ? (
                            <div className="space-y-1">
                              <p className="flex items-center gap-1.5 text-[12px] font-black text-[#243231]">
                                <span className="material-symbols-outlined text-[14px] text-[#aaa197]">
                                  person
                                </span>
                                {targetName}
                              </p>

                              {targetEmail && (
                                <p className="text-[11px] text-[#9b948c]">
                                  {targetEmail}
                                </p>
                              )}

                              {log.meta?.itemTitle && (
                                <div className="inline-flex items-center gap-1 rounded-full bg-[#f5f1eb] px-2.5 py-1 text-[10px] font-bold text-[#6a635d]">
                                  <span className="material-symbols-outlined text-[12px]">
                                    inventory_2
                                  </span>
                                  {log.meta.itemTitle}
                                </div>
                              )}
                            </div>
                          ) : log.meta?.itemTitle ? (
                            <div className="space-y-1">
                              <p className="flex items-center gap-1.5 text-[12px] font-black text-[#243231]">
                                <span className="material-symbols-outlined text-[14px] text-[#aaa197]">
                                  inventory_2
                                </span>
                                {log.meta.itemTitle}
                              </p>
                              <p className="text-[10px] font-bold tracking-[0.18em] text-[#b0a79d] uppercase">
                                Item Target
                              </p>
                            </div>
                          ) : (
                            <span className="text-[#c2b8ae]">—</span>
                          )}
                        </td>

                        {/* Details */}
                        <td className="p-4 max-w-[260px]">
                          <div className="space-y-1.5 text-[12px] leading-6 text-[#6e675f]">
                            {reason && (
                              <p>
                                <span className="text-[#a1988e]">السبب: </span>
                                {reason}
                              </p>
                            )}

                            {log.meta?.reportedBy && (
                              <p>
                                <span className="text-[#a1988e]">المُبلِّغ: </span>
                                {log.meta.reportedBy}
                              </p>
                            )}

                            {log.action === "REPORT_ACTION" &&
                              log.meta?.action &&
                              !reason && (
                                <p>
                                  <span className="text-[#a1988e]">الإجراء: </span>
                                  {log.meta.action}
                                </p>
                              )}

                            {log.details && !reason && <p>{log.details}</p>}

                            {log.meta?.changedFields?.length ? (
                              <p>
                                <span className="text-[#a1988e]">الحقول: </span>
                                {log.meta.changedFields.join("، ")}
                              </p>
                            ) : null}

                            {!reason
                              && !log.meta?.reportedBy
                              && !log.details
                              && !log.meta?.changedFields?.length && (
                              <span className="text-[#c2b8ae]">—</span>
                            )}
                          </div>
                        </td>

                        {/* Admin note */}
                        <td className="p-4 max-w-[240px]">
                          {log.adminNote ? (
                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-[12px] leading-6 text-indigo-700">
                              <div className="mb-1 flex items-center gap-1 text-[11px] font-black">
                                <span className="material-symbols-outlined text-[14px]">
                                  sticky_note_2
                                </span>
                                ملاحظة
                              </div>
                              <p>{log.adminNote}</p>
                            </div>
                          ) : (
                            <span className="text-[#c2b8ae] text-[12px]">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <p className="text-[12px] font-black text-[#5e5852]">
                              {log.createdAt
                                ? new Date(log.createdAt).toLocaleDateString("ar-EG")
                                : "—"}
                            </p>
                            <p className="text-[11px] text-[#a39b92]">
                              {log.createdAt
                                ? new Date(log.createdAt).toLocaleTimeString("ar-EG")
                                : ""}
                            </p>
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
