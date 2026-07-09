"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext"; // 👈 استيراد الـ AuthContext لجلب بيانات المستخدم

export type ChatUser = {
  _id: string;
  name: string;
  avatar?: string;
};

export type ChatMessage = {
  _id: string;
  conversationId: string;
  sender: string | ChatUser;
  text: string;
  read: boolean;
  createdAt: string;
  correlationId?: string;
};

interface UseChatRoomOptions {
  convId: string | null;
}

export function useChatRoom({ convId }: UseChatRoomOptions) {
  const { socket } = useSocket();
  const { user } = useAuth(); // 👈 🌟 تفعيل جلب الـ user هنا لحل مشكلة الـ ReferenceError نهائياً

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket || !convId) {
      setMessages([]);
      setIsJoined(false);
      setIsTyping(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessages([]);
    setIsJoined(false);
    setIsTyping(false);

    const onRoomJoined = ({
      convId: joinedConvId,
      messages: history,
    }: {
      convId: string;
      messages: ChatMessage[];
    }) => {
      if (joinedConvId !== convId) return;

      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }

      setMessages(history ?? []);
      setIsJoined(true);
      setLoading(false);
    };

    const onReceiveMessage = ({
      convId: msgConvId,
      message,
    }: {
      convId: string;
      message: ChatMessage;
    }) => {
      if (msgConvId !== convId) return;

      setMessages((prev) => {
        // 1. استخراج الـ ID الفعلي للمرسل بشكل آمن
        const incomingSenderId = 
          typeof message.sender === "string" 
            ? message.sender 
            : message.sender?._id || "";

        // 2. البحث عن الرسالة المؤقتة المقابلة باستخدام الـ correlationId
        const isOptimisticMatch = prev.some(
          (m) => m.correlationId && message.correlationId && m.correlationId === message.correlationId
        );

        if (isOptimisticMatch) {
          // استبدال الرسالة المؤقتة بالرسمية، وتثبيتها فوراً لتأكيد نجاح الإرسال
          return prev.map((m) =>
            m.correlationId === message.correlationId
              ? { 
                  ...message, 
                  // الآن أصبح الـ user معرّفاً وسيعمل السطر بدون كراش
                  sender: incomingSenderId === user?._id ? "me" : message.sender 
                }
              : m
          );
        }

        // لمنع تكرار الرسالة إذا وصلت عبر البث العام
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }

        return [...prev, message];
      });
    };

    const onTypingStatus = ({
      convId: typingConvId,
      isTyping: typing,
    }: {
      convId?: string;
      isTyping?: boolean;
    } = {}) => {
      if (typingConvId && typingConvId !== convId) return;
      setIsTyping(!!typing);
    };

    const onMessagesRead = ({ conversationId }: { conversationId?: string } = {}) => {
      if (conversationId && conversationId !== convId) return;
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    };

    const onChatError = (payload?: { scope?: string; msg?: string }) => {
      setLoading(false);
      console.error("[useChatRoom] socket error:", payload?.scope, payload?.msg);
    };

    socket.on("room_joined", onRoomJoined);
    socket.on("receive_message", onReceiveMessage);
    socket.on("typing_status", onTypingStatus);
    socket.on("messages_read", onMessagesRead);
    socket.on("chat_error", onChatError);

    socket.emit("join_room", { convId });

    joinTimeoutRef.current = setTimeout(() => setLoading(false), 6000);

    return () => {
      socket.off("room_joined", onRoomJoined);
      socket.off("receive_message", onReceiveMessage);
      socket.off("typing_status", onTypingStatus);
      socket.off("messages_read", onMessagesRead);
      socket.off("chat_error", onChatError);

      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }

      socket.emit("leave_room", { convId });

      setIsJoined(false);
      setIsTyping(false);
      setLoading(false);
    };
  }, [socket, convId, user?._id]); // إضافة user?._id للمصفوفة لضمان دقة التحديث

  const sendMessage = useCallback(
    (text: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const cleanText = text.trim();
        if (!socket || !convId || !cleanText) {
          console.warn("⚠️ [useChatRoom] تم إلغاء الإرسال بسبب حقول فارغة:", { 
            hasSocket: !!socket, 
            convId, 
            hasText: !!cleanText 
          });
          return resolve(false);
        }

        const correlationId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const tempMsg: ChatMessage = {
          _id: correlationId,
          conversationId: convId,
          sender: "me",
          text: cleanText,
          read: false,
          createdAt: new Date().toISOString(),
          correlationId,
        };

        console.log("✏️ [1] تم حقن الرسالة المؤقتة محلياً، جاري البث للسيرفر...");
        setMessages((prev) => [...prev, tempMsg]);

        let settled = false;

        const ackTimeout = setTimeout(() => {
          if (settled) return;
          settled = true;
          console.error("⏱️ [Error] انتهت مهلة الانتظار (Timeout) ولم يستجب السيرفر للرسالة!");
          setMessages((prev) => prev.filter((m) => m.correlationId !== correlationId));
          resolve(false);
        }, 7000);

        console.log("📤 [2] جاري إطلاق حدث send_message عبر المقبس للغرفة:", convId);
        
        socket.emit(
          "send_message",
          { convId, text: cleanText, correlationId },
          (ack?: { ok?: boolean; error?: string; message?: any }) => {
            if (settled) return;
            settled = true;
            clearTimeout(ackTimeout);

            console.log("📥 [3] التقط الهوك إشارة التأكيد (Ack) القادمة من السيرفر:", ack);

            if (!ack?.ok) {
              console.error("❌ [4] السيرفر رفض الحفظ أو أرجع خطأ:", ack?.error);
              setMessages((prev) => prev.filter((m) => m.correlationId !== correlationId));
              return resolve(false);
            }

            console.log("✅ [5] تم تأكيد حفظ الرسالة بنجاح كامل في قاعدة البيانات!");
            resolve(true);
          }
        );
      });
    },
    [socket, convId]
  );

  const emitTyping = useCallback(() => {
    if (!socket || !convId) return;

    socket.emit("typing_status", { convId, isTyping: true });

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing_status", { convId, isTyping: false });
    }, 1500);
  }, [socket, convId]);

  return { messages, isJoined, isTyping, loading, sendMessage, emitTyping };
}