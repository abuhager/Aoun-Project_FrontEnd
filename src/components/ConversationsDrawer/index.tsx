"use client";

import { useEffect, useState } from "react";
import { useSocket } from '@/context/SocketContext';
import ConversationList from "../ConversationList";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function ConversationsDrawer({ isOpen, onClose, onUnreadCountChange }: Props) {
  const { socket } = useSocket();
  // 👈 قمنا بإلغاء مصفوفة الـ triggerRefresh والـ key المسببين لطرد المستخدم من المحادثة

  if (!isOpen) return null;

  return (
    <ConversationList
      isOpen={isOpen}
      onClose={onClose}
      onUnreadCountChange={onUnreadCountChange}
    />
  );
}