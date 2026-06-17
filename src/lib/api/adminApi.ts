
import axiosInstance from '@/lib/api/axiosInstance';

export interface AdminStats {
  totalUsers:     number;
  bannedUsers:    number;
  totalItems:     number;
  deliveredItems: number;
  pendingReports: number;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const { data } = await axiosInstance.get<AdminStats>('/api/admin/stats');
  return data;
};

export interface AdminUser {
  _id:        string;
  name:       string;
  email:      string;
  role:       string;
  trustLevel: number;
  trustScore: number;
  isBanned:   boolean;
  isVerified: boolean;
  createdAt:  string;
}

export const getAdminUsers = async (page = 1, search?: string) => {
  const { data } = await axiosInstance.get<{
    users: AdminUser[];
    total: number;
    pages: number;
  }>('/api/admin/users', { params: { page, search } });
  return data;
};

export const banUser = async (userId: string, reason?: string) => {
  const { data } = await axiosInstance.patch<{ msg: string }>(
    `/api/admin/users/${userId}/ban`,
    { reason }
  );
  return data;
};

export const unbanUser = async (userId: string) => {
  const { data } = await axiosInstance.patch<{ msg: string }>(
    `/api/admin/users/${userId}/unban`
  );
  return data;
};

export const promoteUser = async (userId: string, trustLevel: number) => {
  const { data } = await axiosInstance.patch<{ msg: string }>(
    `/api/admin/users/${userId}/trust`,
    { trustLevel }
  );
  return data;
};