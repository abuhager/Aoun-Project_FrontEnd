import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import axiosInstance from "@/lib/api/axiosInstance";
import type { ProfileResponse } from "@/types/user.types";

export function usePublicProfile() {
  const { id } = useParams<{ id: string }>();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [activeTab,   setActiveTabState] = useState<"donations" | "received">("donations");
  const [page, setPage] = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const setActiveTab = (tab: "donations" | "received") => {
    setActiveTabState(tab);
    setPage(1);
  };

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get<ProfileResponse>(
          `/api/auth/profile/${id}`,
          { params: { page } }
        );
        setProfileData(res.data);
      } catch (requestError: unknown) {
        const message = axios.isAxiosError(requestError)
          ? requestError.response?.data?.msg
          : null;
        setError(message || "تعذر تحميل الملف الشخصي");
      } finally {
        setLoading(false);
      }
    };
    void fetchProfile();
  }, [id, page]);

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.png";
    return url.startsWith("http") ? url : `${apiUrl}/${url}`;
  };

  const renderStars = (ratingOutOfTen: number) =>
    Array.from({ length: 5 }, (_, i) => ({
      key:    i + 1,
      filled: i + 1 <= Math.round(ratingOutOfTen / 2),
    }));

  const activeItems =
    activeTab === "donations"
      ? profileData?.donations ?? []
      : profileData?.received ?? [];

  // ✅ gamification أولاً، ثم user.trustScore، وإلا 0
  const trustScore =
    profileData?.user?.gamification?.trustScore ??
    profileData?.user?.trustScore ??
    0;

  const gamification = profileData?.user?.gamification ?? null;
  const totalItems = activeTab === "donations"
    ? profileData?.stats.donationsCount ?? 0
    : profileData?.stats.receivedCount ?? 0;
  const totalPages = activeTab === "donations"
    ? profileData?.pagination.totalDonationPages ?? 0
    : profileData?.pagination.totalReceivedPages ?? 0;
  const averageRating = profileData?.stats.averageRating ?? 0;

  return {
    profileData, activeTab, setActiveTab,
    loading, error, activeItems,
    trustScore, gamification,
    getImageUrl, renderStars,
    averageRating, totalItems, totalPages,
    page, setPage,
  };
}
