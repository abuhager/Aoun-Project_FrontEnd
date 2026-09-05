"use client";

import type { ChatPanelController } from "./useChatPanelController";

type ChatComposerProps = Pick<ChatPanelController, "inputRef" | "text" | "isJoined" | "canSendMessages" | "canSend" | "isSending" | "handleTextChange" | "handleSend">;

export default function ChatComposer({ inputRef, text, isJoined, canSendMessages, canSend, isSending, handleTextChange, handleSend }: ChatComposerProps) {
  return (
    <footer className="safe-area-bottom shrink-0 border-t border-black/[0.08] bg-white px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea ref={inputRef} rows={1} maxLength={2_000} value={text} disabled={!canSendMessages} onChange={(event) => handleTextChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void handleSend(); } }} placeholder={!isJoined ? "جاري الاتصال..." : canSendMessages ? "اكتب رسالة..." : "المحادثة للقراءة فقط"} className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-outline-variant bg-[#f8faf9] px-4 py-2.5 text-right text-sm font-semibold text-on-surface outline-none placeholder:font-medium placeholder:text-on-surface-soft/70 focus:border-primary/45 focus:bg-white focus:ring-4 focus:ring-primary/[0.06] disabled:opacity-60" />
        <button type="button" aria-label="إرسال الرسالة" onClick={handleSend} disabled={!canSend} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_6px_14px_rgba(0,117,107,.18)] hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"><span className="material-symbols-outlined text-[18px]">{isSending ? "hourglass_top" : "send"}</span></button>
      </div>
    </footer>
  );
}
