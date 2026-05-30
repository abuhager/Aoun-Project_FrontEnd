"use client";

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { getAccessToken } from '@/lib/api/axiosInstance';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socketSingleton: Socket | null = null;

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token) return;

    if (socketSingleton?.connected) {
      socketRef.current = socketSingleton;
      return;
    }

    if (socketSingleton) {
      socketSingleton.disconnect();
      socketSingleton = null;
    }

    socketSingleton = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 8000,
    });

    socketRef.current = socketSingleton;
  }, []);

  useEffect(() => {
    if (!user?._id || !isAuthenticated) {
      if (socketSingleton) {
        socketSingleton.disconnect();
        socketSingleton = null;
      }
      socketRef.current = null;
      return;
    }

    connect();

    const handleAuthError = ({ code }: { code: string }) => {
      if (code === 'TOKEN_EXPIRED') {
        setTimeout(() => {
          const freshToken = getAccessToken();
          if (freshToken && socketSingleton) {
            socketSingleton.auth = { token: freshToken };
            socketSingleton.disconnect().connect();
          }
        }, 1500);
      }
    };

    socketSingleton?.on('auth_error', handleAuthError);

    return () => {
      socketSingleton?.off('auth_error', handleAuthError);
    };
  }, [user?._id, isAuthenticated, connect]);

  return socketRef;
}