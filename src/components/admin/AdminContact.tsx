"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "@/lib/api/axiosInstance";
import ChatDrawer from "@/components/ChatDrawer";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";
import { useAuth } from "@/context/AuthContext";
export default function AdminContact({ userId, name }: { userId?: string; name?: string | null }) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!userId) return <span>حساب غير متاح</span>;
  async function open() {
    setError("");
    if (user?.isDemo) { setError("عرض تجريبي: سيفتح الأدمن هنا محادثة خاصة مع المستخدم. لم يتم إنشاء محادثة أو إرسال رسالة."); return; }
    setBusy(true);
    try { const { data } = await axios.post(`/api/admin/users/${userId}/conversation`); setConversationId(data.conversation._id); }
    catch (e) { setError(extractErrorMsg(e)); }
    finally { setBusy(false); }
  }
  return <div className="space-y-2 text-xs"><Link className="font-bold text-primary underline" href={`/profile/${userId}`}>{name || "عرض الحساب"}</Link>{user?._id !== userId && <button type="button" className="mx-2 rounded-lg bg-primary/10 px-3 py-2 font-bold text-primary disabled:opacity-50" disabled={busy} onClick={() => void open()}>{busy ? "جارٍ الفتح…" : "محادثة خاصة"}</button>}{error && <p role="status" className="max-w-xs text-amber-800">{error}</p>}{conversationId && <ChatDrawer conversationId={conversationId} itemTitle="تواصل مع الإدارة" isOpen onClose={() => setConversationId(null)} />}</div>;
}
