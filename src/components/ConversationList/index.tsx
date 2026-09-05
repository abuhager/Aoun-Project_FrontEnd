"use client";

import { ChatPanel } from "@/components/ChatDrawer";
import AccessibleDialog from "@/components/ui/AccessibleDialog";
import { ConversationInbox } from "./ConversationInbox";
import { useConversationListController } from "./useConversationListController";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
  initialConversationId?: string | null;
}

export default function ConversationList({
  isOpen,
  onClose,
  onUnreadCountChange,
  initialConversationId = null,
}: Props) {
  const controller = useConversationListController({
    isOpen,
    initialConversationId,
    onUnreadCountChange,
  });

  if (!isOpen) return null;

  return (
    <AccessibleDialog
      ariaLabel="مركز الرسائل"
      onClose={onClose}
      overlayClassName="fixed inset-0 z-[110] flex items-center justify-center bg-[#071d21]/65 p-0 backdrop-blur-sm md:p-4"
      panelClassName="relative h-dvh w-full overflow-hidden bg-white shadow-2xl md:h-[min(760px,calc(100dvh-2rem))] md:max-w-[1180px] md:rounded-2xl md:border md:border-white/20"
    >
      <div dir="ltr" className="grid h-full min-h-0 bg-white lg:grid-cols-[minmax(0,1fr)_340px]">
        <ConversationInbox {...controller} onClose={onClose} />

        <div
          dir="rtl"
          className={`${controller.selected ? "flex" : "hidden lg:flex"} min-h-0 min-w-0 bg-[#f5f7f6] lg:col-start-1 lg:row-start-1`}
        >
          {controller.selected ? (
            <ChatPanel
              key={controller.selected._id}
              conversationId={controller.selected._id}
              itemTitle={controller.selected.item?.title || "الغرض"}
              participantName={controller.selectedParticipant?.name || "مستخدم عون"}
              participantAvatar={controller.selectedParticipant?.avatar}
              onBack={controller.returnToInbox}
              onClose={onClose}
            />
          ) : (
            <EmptyConversation unreadTotal={controller.unreadTotal} />
          )}
        </div>
      </div>
    </AccessibleDialog>
  );
}

function EmptyConversation({ unreadTotal }: { unreadTotal: number }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <span className="material-symbols-outlined text-[30px]">forum</span>
        {unreadTotal > 0 && (
          <span className="absolute -left-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-lg border-2 border-[#f3f7f5] bg-primary px-1 text-[9px] font-black text-white">
            {unreadTotal > 99 ? "+99" : unreadTotal}
          </span>
        )}
      </div>
      <h2 className="mt-5 text-lg font-black text-on-surface">اختر محادثة</h2>
      <p className="mt-2 max-w-sm text-xs font-semibold leading-6 text-on-surface-soft">
        اختر محادثة من القائمة لتنسيق تفاصيل التسليم.
      </p>
    </div>
  );
}
