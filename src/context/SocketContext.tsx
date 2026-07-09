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
  const [isConnected, setIsConnected] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // 1️⃣ مراقبة الدخول ومحاولة صيد التوكن الفعلي فور جاهزيته
  useEffect(() => {
    // إذا لم يكن المستخدم مسجلاً أو في صفحة تسجيل الدخول، أوقف المؤقت فوراً بسلام
    if (!user?._id || !isAuthenticated) {
      setAuthToken(null);
      return;
    }

    const checkToken = () => {
      const token = getAccessToken();
      if (token) {
        console.log("🔑 [Socket Sync] التقط المقبس التوكن النشط بنجاح!");
        setAuthToken(token);
        clearInterval(tokenInterval);
      }
    };

    const tokenInterval = setInterval(checkToken, 500);
    checkToken(); 

    return () => clearInterval(tokenInterval);
  }, [user?._id, isAuthenticated]);

  // 2️⃣ إطلاق الاتصال الفعلي فقط وفقط إذا كان التوكن موجوداً ومعبأً
  useEffect(() => {
    if (!authToken) {
      if (socketRef.current) {
        console.log("🔌 [Socket] جاري قطع الاتصال لعدم توفر توكن صالح...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    if (socketRef.current?.connected) {
      setIsConnected(true);
      return;
    }

    console.log("🌐 [Socket] إطلاق الاتصال المباشر الآمن بالتوكن الحقيقي الحاسم...");

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: authToken
      },
      query: {
        token: authToken // حماية مزدوجة لتخطي أي كاش في المقابس
      },
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("🟢 [Socket] تم الاتصال بنجاح تام بالسيرفر الفعلي! ID:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("🟡 [Socket] انقطع الاتصال بسبب:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("🔴 [Socket Connect Error] السيرفر رفض الاتصال بسبب:", err.message);
      setIsConnected(false);
    });

    return () => {
      if (socketInstance) {
        socketInstance.off("connect");
        socketInstance.off("disconnect");
        socketInstance.off("connect_error");
        socketInstance.disconnect();
        socketRef.current = null;
      }
    };
  }, [authToken]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}