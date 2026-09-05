"use client";

import AccessibleDialog from "@/components/ui/AccessibleDialog";
import ChatComposer from "./ChatComposer";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import type { ChatDrawerProps, ChatPanelProps } from "./chatDrawer.types";
import { useChatPanelController } from "./useChatPanelController";

export function ChatPanel({
  conversationId,
  itemTitle,
  participantName = "محادثة التسليم",
  participantAvatar,
  onClose,
  onBack,
  showClose = true,
}: ChatPanelProps) {
  const controller = useChatPanelController(conversationId);

  return (
    <section dir="rtl" className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-white" aria-label={`محادثة حول ${itemTitle}`}>
      <ChatHeader itemTitle={itemTitle} participantName={participantName} participantAvatar={participantAvatar} isJoined={controller.isJoined} onClose={onClose} onBack={onBack} showClose={showClose} />
      <ChatMessageList {...controller} />
      <ChatComposer {...controller} />
    </section>
  );
}

export default function ChatDrawer({ conversationId, itemTitle, isOpen, onClose }: ChatDrawerProps) {
  if (!isOpen) return null;

  return (
    <AccessibleDialog
      ariaLabel={`محادثة حول ${itemTitle}`}
      onClose={onClose}
      overlayClassName="fixed inset-0 z-[120] flex items-center justify-center bg-[#071d21]/65 p-0 backdrop-blur-sm sm:p-5"
      panelClassName="relative flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(740px,calc(100dvh-2.5rem))] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-white/20"
    >
      <ChatPanel conversationId={conversationId} itemTitle={itemTitle} onClose={onClose} />
    </AccessibleDialog>
  );
}
