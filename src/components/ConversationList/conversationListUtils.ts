import type { ChatParticipant, ConversationListItem } from "@/types/chat.types";

export function getAvatarBgColor(name: string): { bg: string; text: string } {
  const charCode = name.charCodeAt(0) || 0;
  const colors = [
    { bg: "bg-teal-50", text: "text-teal-700" },
    { bg: "bg-emerald-50", text: "text-emerald-700" },
    { bg: "bg-amber-50", text: "text-amber-700" },
    { bg: "bg-sky-50", text: "text-sky-700" },
    { bg: "bg-indigo-50", text: "text-indigo-700" },
    { bg: "bg-rose-50", text: "text-rose-700" },
  ];
  return colors[charCode % colors.length];
}

export function formatTimestamp(dateStr?: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("ar-JO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "أمس";

  return date.toLocaleDateString("ar-JO", { month: "short", day: "numeric" });
}

export function getOtherParticipant(
  conversation: ConversationListItem,
  userId?: string
): ChatParticipant | null {
  return (
    conversation.participants?.find((participant) => participant._id !== userId) ||
    conversation.owner ||
    conversation.requester ||
    null
  );
}
