"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { getAccessToken } from '@/lib/api/axiosInstance'; // ✅ من الذاكرة

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;

export function useSocket() {
  const { user, isLoggedIn } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?._id || !isLoggedIn) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      socketRef.current = null;
      return;
    }

    // ✅ M2 — اجلب الـ token من الذاكرة مباشرة
    const token = getAccessToken();
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket'],
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 5000,
      });
    }

    socketRef.current = socketInstance;

    // ✅ M2 — أرسل الـ token بدل user._id
    socketInstance.emit('join', token);

    // ✅ استمع لأخطاء الـ auth
    socketInstance.on('auth_error', ({ code }) => {
      if (code === 'TOKEN_EXPIRED') {
        // انتظر ثانية لإعطاء وقت لـ axiosInstance يجدد الـ token
        setTimeout(() => {
          const newToken = getAccessToken();
          if (newToken) socketInstance?.emit('join', newToken);
        }, 1000);
      }
    });

  }, [user?._id, isLoggedIn]);

  return socketRef;
}