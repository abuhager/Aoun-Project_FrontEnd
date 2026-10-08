"use client";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import axios from "@/lib/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import ChatDrawer from "@/components/ChatDrawer";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
type Person = { _id: string; name: string };
type Ticket = { _id: string; subject: string; status: "open" | "in_progress" | "resolved"; requester: Person | null; assignedTo: Person | null; updatedAt: string };
const labels = { open: "بانتظار الدعم", in_progress: "قيد المعالجة", resolved: "تم الحل" };
export default function SupportDesk({ admin = false }: { admin?: boolean }) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, error, isLoading, mutate } = useSWR<{ tickets: Ticket[]; pages: number; total: number }>(user ? `/api/support${admin ? "/inbox" : ""}?page=${page}` : null, async url => (await axios.get(url)).data, { refreshInterval: 15000 });
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ id: string; title: string } | null>(null);
  async function action(path: string, body?: object) {
    setMessage("");
    if (user?.isDemo) { setMessage("عرض تجريبي: هذا الإجراء متاح للأدمن الحقيقي. لم يتم تعديل الطلب أو إرسال رسائل."); return; }
    setBusy(true);
    try {
      const { data: result } = await axios.post(path, body);
      if (result.conversation) setChat({ id: result.conversation._id, title: result.conversation.subject || "خدمة الدعم" });
      await mutate();
    } catch (e) { setMessage(extractErrorMsg(e)); }
    finally { setBusy(false); }
  }
  return <section dir="rtl" className="space-y-6"><div><h1 className="text-2xl font-black">{admin ? "طلبات الدعم" : "تواصل مع خدمة الدعم"}</h1><p className="mt-2 text-sm text-gray-600">{admin ? "استلم الطلب لتبدأ محادثة خاصة مع صاحبه، ثم أغلقه بعد حل المشكلة." : "اكتب عنوان مشكلتك وافتح محادثة خاصة مع فريق الدعم. يمكنك متابعة الردود من هنا أو من الرسائل."}</p></div>
    {!admin && <form className="rounded-2xl bg-white p-5 shadow-sm" onSubmit={event => { event.preventDefault(); void action("/api/support", { subject }); }}><label htmlFor="support-subject" className="block font-bold">عنوان المشكلة</label><input id="support-subject" className="my-3 w-full rounded-xl border p-3" value={subject} onChange={event => setSubject(event.target.value)} minLength={3} maxLength={150} required placeholder="مثلاً: تعذر تأكيد استلام الغرض" /><button disabled={busy} className="btn-primary" type="submit">فتح / إعادة فتح محادثة الدعم</button><p className="mt-3 text-xs text-gray-500">تُحفظ متابعة مشكلتك في محادثة واحدة خاصة بحسابك.</p></form>}
    {message && <p role="status" className="rounded-xl bg-amber-50 p-4 text-amber-900">{message}</p>}
    {isLoading && <p role="status">جارٍ تحميل طلبات الدعم…</p>}
    {error && <div role="alert">تعذر تحميل الطلبات. <button onClick={() => void mutate()} className="underline">إعادة المحاولة</button></div>}
    {!isLoading && !error && data?.tickets.length === 0 && <p className="rounded-2xl bg-white p-8 text-center">لا توجد طلبات دعم حالياً.</p>}
    <div className="grid gap-4 md:grid-cols-2">{data?.tickets.map(ticket => <article key={ticket._id} className="space-y-4 rounded-2xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{ticket.subject}</h2><span className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-800">{labels[ticket.status]}</span></div>{ticket.requester && <Link className="block text-sm text-primary underline" href={`/profile/${ticket.requester._id}`}>{ticket.requester.name}</Link>}<p className="text-xs text-gray-500">المشرف: {ticket.assignedTo?.name || "لم يتم الاستلام بعد"}</p><time className="block text-xs text-gray-500">{new Date(ticket.updatedAt).toLocaleString("ar-JO")}</time><div className="flex flex-wrap gap-3">
      {(!admin || ticket.assignedTo?._id === user?._id) && <button className="btn-primary" onClick={() => setChat({ id: ticket._id, title: ticket.subject })}>فتح المحادثة</button>}
      {admin && ticket.assignedTo?._id !== user?._id && <button disabled={busy} className="btn-primary" onClick={() => void action(`/api/support/${ticket._id}/claim`)}>استلام الطلب</button>}
      {admin && ticket.assignedTo?._id === user?._id && ticket.status !== "resolved" && <button disabled={busy} className="rounded-xl border px-4 py-2 text-sm" onClick={() => void action(`/api/support/${ticket._id}/resolve`)}>تم حل المشكلة</button>}
    </div></article>)}</div>
    {(data?.pages ?? 0) > 1 && <nav aria-label="صفحات الدعم" className="flex items-center gap-4"><button disabled={page === 1} onClick={() => setPage(page - 1)}>السابق</button><span>{page} / {data?.pages}</span><button disabled={page >= (data?.pages ?? 1)} onClick={() => setPage(page + 1)}>التالي</button></nav>}
    {chat && <ChatDrawer conversationId={chat.id} itemTitle={chat.title} isOpen onClose={() => setChat(null)} />}
  </section>;
}
