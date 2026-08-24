// src/lib/api/notificationApi.ts
import axiosInstance from './axiosInstance';
import type { NotificationsResponse } from '@/types/notification.types';

export const getNotifications = async (
  limit = 20,
  signal?: AbortSignal,
): Promise<NotificationsResponse> => {
  const { data } = await axiosInstance.get<NotificationsResponse>(
    '/api/notifications',
    { params: { limit }, signal },
  );
  return data;
};

export const markAllRead = async (): Promise<void> => {
  await axiosInstance.patch('/api/notifications/read-all');
};

export const markOneRead = async (id: string): Promise<void> => {
  await axiosInstance.patch(`/api/notifications/${id}/read`);
};
