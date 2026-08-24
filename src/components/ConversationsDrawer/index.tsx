"use client";

import ConversationList from "../ConversationList";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
  initialConversationId?: string | null;
}

export default function ConversationsDrawer({
  isOpen,
  onClose,
  onUnreadCountChange,
  initialConversationId = null,
}: Props) {
  if (!isOpen) return null;

  return (
    <ConversationList
      key={initialConversationId || "inbox"}
      isOpen={isOpen}
      onClose={onClose}
      onUnreadCountChange={onUnreadCountChange}
      initialConversationId={initialConversationId}
    />
  );
}
