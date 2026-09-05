"use client";

import type { ChatPanelController } from "./useChatPanelController";
import { formatMessageDate, formatMessageTime, getSenderId, isSameDay } from "./chatMessageUtils";

type ChatMessageListProps = Pick<ChatPanelController, "messages" | "currentUserId" | "hasOlder" | "loadingOlder" | "handleLoadOlder" | "isJoined" | "canSendMessages" | "loading" | "error" | "statusMessage" | "isTyping" | "scrollRef" | "bottomRef">;

export default function ChatMessageList({ messages, currentUserId, hasOlder, loadingOlder, handleLoadOlder, isJoined, canSendMessages, loading, error, statusMessage, isTyping, scrollRef, bottomRef }: ChatMessageListProps) {
  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f5f7f6] px-3 py-4 sm:px-6" role="log" aria-live="polite">
      <div className="mx-auto min-h-full w-full max-w-3xl">
        {hasOlder && <div className="pb-4 text-center"><button type="button" disabled={loadingOlder} onClick={handleLoadOlder} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-[10px] font-black text-primary shadow-sm hover:border-primary/30 disabled:opacity-50"><span className="material-symbols-outlined text-[14px]">history</span>{loadingOlder ? "جاري التحميل..." : "تحميل رسائل أقدم"}</button></div>}
        {isJoined && !canSendMessages && <div className="mx-auto mb-4 max-w-lg rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-[10px] font-bold leading-5 text-amber-800">هذه المحادثة للقراءة فقط لأن الحجز لم يعد قائماً.</div>}
        {statusMessage && messages.length === 0 && <div role={error ? "alert" : "status"} className={`flex min-h-60 flex-col items-center justify-center gap-2 text-center text-xs font-bold ${error ? "text-danger" : "text-on-surface-soft"}`}><span className={`material-symbols-outlined text-[28px] ${loading ? "animate-pulse" : ""}`}>{error ? "wifi_off" : "sync"}</span>{statusMessage}</div>}
        {!loading && !error && messages.length === 0 && <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary"><span className="material-symbols-outlined text-[26px]">chat</span></div><h3 className="mt-4 text-sm font-black text-on-surface">ابدأ المحادثة</h3><p className="mt-1 max-w-sm text-[11px] font-semibold leading-6 text-on-surface-soft">نسّق موعد ومكان التسليم مع الطرف الآخر.</p></div>}
        {messages.map((message, index) => {
          const currentSenderId = getSenderId(message);
          const isMe = currentSenderId === currentUserId || currentSenderId === "me";
          const previousMessage = index > 0 ? messages[index - 1] : null;
          const previousSenderId = previousMessage ? getSenderId(previousMessage) : null;
          const showDate = !previousMessage || !isSameDay(previousMessage.createdAt, message.createdAt);
          const isGrouped = !showDate && previousSenderId === currentSenderId;
          const isTemporary = message._id.startsWith("temp-");
          return <div key={message._id}>{showDate && <div className="my-5 flex items-center gap-3" role="separator"><span className="h-px flex-1 bg-black/[0.06]" /><time className="rounded-full bg-white px-3 py-1 text-[9px] font-bold text-on-surface-soft shadow-sm">{formatMessageDate(message.createdAt)}</time><span className="h-px flex-1 bg-black/[0.06]" /></div>}<div className={`flex w-full ${isGrouped ? "mt-1" : "mt-3"}`}><div className={`max-w-[86%] sm:max-w-[72%] ${isMe ? "ml-auto" : "mr-auto"}`}><div className={`break-words whitespace-pre-wrap px-3.5 py-2 text-right text-[13px] leading-6 ${isMe ? "rounded-2xl rounded-br-sm bg-primary text-white" : "rounded-2xl rounded-bl-sm border border-black/[0.07] bg-white text-on-surface"} ${isTemporary ? "opacity-60" : ""}`}><p>{message.text}</p><span dir="ltr" className={`mt-0.5 flex items-center justify-end gap-1 text-[8.5px] font-semibold ${isMe ? "text-white/65" : "text-on-surface-soft"}`}>{isTemporary ? "جاري الإرسال..." : formatMessageTime(message.createdAt)}{isMe && !isTemporary && <span className="material-symbols-outlined text-[11px]">{message.read ? "done_all" : "done"}</span>}</span></div></div></div></div>;
        })}
        {error && messages.length > 0 && <p role="alert" className="py-3 text-center text-[10px] font-bold text-danger">{error}</p>}
        {isTyping && <div className="mt-2 flex justify-start"><span className="rounded-xl border border-black/[0.07] bg-white px-3 py-2 text-[10px] font-bold text-on-surface-soft">يكتب الآن...</span></div>}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
