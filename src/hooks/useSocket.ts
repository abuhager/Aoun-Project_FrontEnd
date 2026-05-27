// src/hooks/useSocket.ts
"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

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
    socketInstance.emit('join', user._id);

  }, [user?._id, isLoggedIn]);

  // ✅ ارجع الـ ref نفسه مش .current
  return socketRef;
}