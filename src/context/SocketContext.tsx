"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/lib/api/axiosInstance";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 1️⃣ دمج صيد التوكن وإطلاق الاتصال في Effect واحد مبني على الـ Lifecycle لمنع الـ Cascading Renders
  useEffect(() => {
    let tokenInterval: ReturnType<typeof setInterval> | null = null;

    // دالة تهيئة الاتصال الفعلي بالمقبس
    const initializeSocket = (token: string) => {
      if (socketRef.current?.connected) return;

      console.log("🌐 [Socket] إطلاق الاتصال المباشر الآمن بالتوكن الحقيقي الحاسم...");

      const instance = io(SOCKET_URL, {
        auth: { token },
        query: { token },
        withCredentials: true,
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1500,
      });

      socketRef.current = instance;
      setSocketInstance(instance);

      instance.on("connect", () => {
        console.log("🟢 [Socket] تم الاتصال بنجاح تام بالسيرفر الفعلي! ID:", instance.id);
        setIsConnected(true);
      });

      instance.on("disconnect", (reason) => {
        console.warn("🟡 [Socket] انقطع الاتصال بسبب:", reason);
        setIsConnected(false);
        setSocketInstance(null);
      });

      instance.on("connect_error", (err) => {
        console.error("🔴 [Socket Connect Error] السيرفر رفض الاتصال بسبب:", err.message);
        setIsConnected(false);
        setSocketInstance(null);
      });
    };

    // دالة التحقق من التوكن
    const checkToken = () => {
      const token = getAccessToken();
      if (token) {
        console.log("🔑 [Socket Sync] التقط المقبس التوكن النشط بنجاح!");
        initializeSocket(token);
        if (tokenInterval) clearInterval(tokenInterval);
      }
    };

    // التنظيف المباشر عند خروج المستخدم أو عدم تسجيله
    if (!user?._id || !isAuthenticated) {
      if (socketRef.current) {
        console.log("🔌 [Socket] جاري قطع الاتصال لعدم توفر توكن صالح...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // الـ Callbacks لحدث الـ disconnect بالأعلى ستتكفل بتصفير الـ state بشكل غير متزامن وآمن تماماً
      return;
    }

    // تشغيل فحص التوكن
    tokenInterval = setInterval(checkToken, 500);
    checkToken(); 

    return () => {
      if (tokenInterval) clearInterval(tokenInterval);
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("connect_error");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id, isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}