import type { ChatMessage } from "@/types/chat.types";

export const getSenderId = (message: ChatMessage) =>
  typeof message.sender === "string" ? message.sender : message.sender._id;

export const isSameDay = (first: string, second: string) =>
  new Date(first).toDateString() === new Date(second).toDateString();

export const formatMessageTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString("ar-JO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export const formatMessageDate = (createdAt: string) => {
  const date = new Date(createdAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "اليوم";
  if (date.toDateString() === yesterday.toDateString()) return "أمس";
  return date.toLocaleDateString("ar-JO", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
};
