// src/lib/api/notificationApi.ts
import axiosInstance from './axiosInstance';
// استيراد النوع الجديد كـ Object
import type { NotificationsResponse } from '@/types/notification.types';

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const { data } = await axiosInstance.get<NotificationsResponse>('/api/notifications');
  return data; // البيانات هنا تحتوي على notifications و unreadCount
};

export const markAllRead = async (): Promise<void> => {
  await axiosInstance.patch('/api/notifications/read-all');
};

export const markOneRead = async (id: string): Promise<void> => {
  await axiosInstance.patch(`/api/notifications/${id}/read`);
};