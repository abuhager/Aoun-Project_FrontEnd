"use client";

import Image from "next/image";
import type { ConversationListItem } from "@/types/chat.types";
import {
  formatTimestamp,
  getAvatarBgColor,
  getOtherParticipant,
} from "./conversationListUtils";
import type { ConversationListController } from "./useConversationListController";

type ConversationInboxProps = Pick<
  ConversationListController,
  | "conversations"
  | "filteredConversations"
  | "conversationsError"
  | "isLoading"
  | "missingRequestedConversation"
  | "selected"
  | "selectedId"
  | "unreadTotal"
  | "search"
  | "setSearch"
  | "userId"
  | "openConversation"
  | "returnToInbox"
  | "retry"
> & { onClose: () => void };

export function ConversationInbox(props: ConversationInboxProps) {
  const {
    conversations,
    filteredConversations,
    conversationsError,
    isLoading,
    missingRequestedConversation,
    selected,
    selectedId,
    unreadTotal,
    search,
    setSearch,
    userId,
    openConversation,
    returnToInbox,
    retry,
    onClose,
  } = props;

  return (
    <aside
      dir="rtl"
      className={`${selected ? "hidden lg:flex" : "flex"} min-h-0 flex-col border-black/[0.08] bg-white lg:col-start-2 lg:row-start-1 lg:border-r-0 lg:border-l`}
      aria-label="قائمة المحادثات"
    >
      <InboxHeader
        count={conversations.length}
        unreadTotal={unreadTotal}
        showClose={!selected}
        onClose={onClose}
      />
      <ConversationSearch value={search} onChange={setSearch} autoFocus={!selected} />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white py-1">
        {isLoading ? (
          <InboxSkeleton />
        ) : conversationsError ? (
          <InboxError onRetry={retry} />
        ) : missingRequestedConversation ? (
          <MissingConversation onReturn={returnToInbox} />
        ) : conversations.length === 0 ? (
          <EmptyInbox />
        ) : filteredConversations.length === 0 ? (
          <EmptySearch onClear={() => setSearch("")} />
        ) : (
          <div>
            {filteredConversations.map((conversation) => (
              <ConversationRow
                key={conversation._id}
                conversation={conversation}
                userId={userId}
                selected={conversation._id === selectedId}
                onOpen={openConversation}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function InboxHeader({
  count,
  unreadTotal,
  showClose,
  onClose,
}: {
  count: number;
  unreadTotal: number;
  showClose: boolean;
  onClose: () => void;
}) {
  return (
    <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-black/[0.08] bg-white px-4 sm:px-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black text-on-surface">الرسائل</h2>
          {unreadTotal > 0 && <UnreadBadge count={unreadTotal} />}
        </div>
        <p className="mt-1 text-[10px] font-bold text-on-surface-soft">{count} محادثة</p>
      </div>
      {showClose && (
        <button type="button" aria-label="إغلاق الرسائل" onClick={onClose} className="touch-target -ml-2 flex shrink-0 items-center justify-center rounded-lg text-on-surface-soft hover:bg-surface-container-low hover:text-on-surface">
          <span className="material-symbols-outlined text-[21px]">close</span>
        </button>
      )}
    </header>
  );
}

function ConversationSearch({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus: boolean;
}) {
  return (
    <div className="shrink-0 border-b border-black/[0.06] bg-[#f8faf9] p-3">
      <label className="relative block" htmlFor="conversation-search">
        <span className="sr-only">البحث في المحادثات</span>
        <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-soft">search</span>
        <input
          id="conversation-search"
          data-dialog-initial-focus={autoFocus || undefined}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="ابحث في الرسائل..."
          className="h-10 w-full rounded-lg border border-outline-variant bg-white py-2 pr-10 pl-3 text-xs font-semibold text-on-surface outline-none placeholder:text-on-surface-soft/70 focus:border-primary/40 focus:ring-4 focus:ring-primary/[0.06]"
        />
      </label>
    </div>
  );
}

function ConversationRow({
  conversation,
  userId,
  selected,
  onOpen,
}: {
  conversation: ConversationListItem;
  userId?: string;
  selected: boolean;
  onOpen: (conversation: ConversationListItem) => Promise<void>;
}) {
  const other = getOtherParticipant(conversation, userId);
  const hasUnread = (conversation.unreadCount || 0) > 0;
  const name = other?.name || "مستخدم عون";
  const avatarColors = getAvatarBgColor(name);

  return (
    <button
      type="button"
      onClick={() => void onOpen(conversation)}
      aria-current={selected ? "true" : undefined}
      className={`group relative flex w-full items-center gap-3 border-b border-black/[0.055] px-4 py-3 text-right transition-colors ${
        selected
          ? "bg-primary-soft/70"
          : hasUnread
            ? "bg-primary-softer/55"
            : "bg-white hover:bg-[#f8faf9]"
      }`}
    >
      {selected && <span aria-hidden="true" className="absolute inset-y-0 right-0 w-[3px] bg-primary" />}
      <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/[0.04] text-sm font-black ${avatarColors.bg} ${avatarColors.text}`}>
        {other?.avatar ? (
          <Image src={other.avatar} alt="" fill className="object-cover" sizes="44px" />
        ) : (
          <span>{name[0]?.toUpperCase()}</span>
        )}
        {hasUnread && <span aria-hidden="true" className="absolute bottom-0.5 left-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`min-w-0 flex-1 truncate text-[12px] ${hasUnread ? "font-black text-on-surface" : "font-extrabold text-on-surface-variant"}`}>
            {conversation.item?.title || "غرض غير متاح"}
          </p>
          <time className="shrink-0 text-[9px] font-bold text-on-surface-soft">
            {formatTimestamp(conversation.lastMessageAt || conversation.updatedAt)}
          </time>
        </div>
        <p className="mt-0.5 truncate text-[10px] font-bold text-on-surface-soft">{name}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <p className={`min-w-0 flex-1 truncate text-[10.5px] ${hasUnread ? "font-extrabold text-on-surface-variant" : "font-semibold text-on-surface-soft"}`}>
            {conversation.lastMessage || "ابدأ التنسيق والحديث الآن..."}
          </p>
          {hasUnread && <UnreadBadge count={conversation.unreadCount} />}
        </div>
      </div>
    </button>
  );
}

function UnreadBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-primary px-1 text-[9px] font-black text-white">
      {count > 99 ? "+99" : count}
    </span>
  );
}

function InboxSkeleton() {
  return (
    <div role="status" className="space-y-2 px-1 py-2" aria-label="جاري تحميل المحادثات">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="flex animate-pulse items-center gap-3 rounded-xl bg-white p-3">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-surface-container" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-2/3 rounded bg-surface-container" />
            <div className="h-2 w-5/6 rounded bg-surface-container-low" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InboxError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex min-h-60 flex-col items-center justify-center px-6 text-center text-danger">
      <span className="material-symbols-outlined text-3xl">cloud_off</span>
      <p className="mt-3 text-xs font-black">تعذر تحميل المحادثات</p>
      <button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-danger/20 bg-white px-3 py-2 text-[10px] font-black">المحاولة مجدداً</button>
    </div>
  );
}

function MissingConversation({ onReturn }: { onReturn: () => void }) {
  return (
    <div role="alert" className="flex min-h-60 flex-col items-center justify-center px-6 text-center text-danger">
      <span className="material-symbols-outlined text-3xl">chat_error</span>
      <p className="mt-3 text-xs font-black">المحادثة المطلوبة لم تعد متاحة لهذا الحساب</p>
      <button type="button" onClick={onReturn} className="btn-secondary mt-4 min-h-9 px-3 py-2 text-[10px]">العودة للصندوق</button>
    </div>
  );
}

function EmptyInbox() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-white text-primary shadow-sm">
        <span className="material-symbols-outlined text-[27px]">mark_chat_unread</span>
      </div>
      <h3 className="mt-4 text-sm font-black text-on-surface">صندوقك جاهز</h3>
      <p className="mt-1 text-[11px] font-semibold leading-6 text-on-surface-soft">ستظهر المحادثات هنا عند حجز غرض أو استلام طلب جديد.</p>
    </div>
  );
}

function EmptySearch({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
      <span className="material-symbols-outlined text-3xl text-on-surface-soft">search_off</span>
      <p className="mt-3 text-xs font-black text-on-surface-variant">لا توجد نتائج مطابقة</p>
      <button type="button" onClick={onClear} className="mt-2 text-[10px] font-black text-primary hover:underline">مسح البحث</button>
    </div>
  );
}
