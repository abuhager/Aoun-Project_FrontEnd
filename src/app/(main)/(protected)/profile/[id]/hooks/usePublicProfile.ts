import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../../../../../../lib/api/authApi';
import { ProfileResponse } from '../../../../../../types/user.types';

export function usePublicProfile(userId: string) {
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await authApi.getPublicProfile(userId);
      setProfileData(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'تعذر جلب بيانات المستخدم');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profileData,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}