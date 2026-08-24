import axiosInstance from '@/lib/api/axiosInstance';
import type { AuthUser, ProfileResponse } from '@/types/user.types';

type UpdateProfileResponse = AuthUser | { user: AuthUser };

export async function getPublicProfile(
  userId: string,
  page = 1,
  signal?: AbortSignal
): Promise<ProfileResponse> {
  const { data } = await axiosInstance.get<ProfileResponse>(
    `/api/auth/profile/${userId}`,
    { params: { page }, signal }
  );
  return data;
}

export async function updateMyProfile(payload: FormData): Promise<AuthUser> {
  const { data } = await axiosInstance.put<UpdateProfileResponse>(
    '/api/auth/me',
    payload
  );
  return 'user' in data ? data.user : data;
}

export async function changeMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ msg?: string }> {
  const { data } = await axiosInstance.put<{ msg?: string }>(
    '/api/auth/me/password',
    payload
  );
  return data;
}
