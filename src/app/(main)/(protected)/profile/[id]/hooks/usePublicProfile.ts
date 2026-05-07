import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/api/axiosInstance";

export interface ProfileItem {
  _id:       string;
  title:     string;
  imageUrl:  string;
  status:    string;
  createdAt: string;
}

export interface ProfileData {
  user: {
    name:               string;
    avatar?:            string;
    trustScore:         number;
    createdAt:          string;
    isVerifiedStudent?: boolean;
    whatsapp?:          string;  // ✅ رقم منسق جاهز لـ wa.me
  };
  stats: {
    donationsCount: number;
    receivedCount:  number;
    totalRatings:   number;
  };
  allDonations:       ProfileItem[];
  completedRequests:  ProfileItem[];
}

export function usePublicProfile() {
  const { id } = useParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [activeTab,   setActiveTab]   = useState<"donations" | "requests">("donations");
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/api/auth/profile/${id}`);
        setProfileData(res.data);
      } catch {
        // صامت — لا console.error في Production
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.png";
    return url.startsWith("http") ? url : `${apiUrl}/${url}`;
  };

  const renderStars = (score: number) =>
    Array.from({ length: 5 }, (_, i) => ({
      key:    i + 1,
      filled: i + 1 <= Math.floor(score / 20),
    }));

  const activeItems =
    activeTab === "donations"
      ? profileData?.allDonations ?? []
      : profileData?.completedRequests ?? [];

  const trustScore = profileData?.user?.trustScore ?? 85;

  return {
    profileData, activeTab, setActiveTab,
    loading, activeItems, trustScore,
    getImageUrl, renderStars,
  };
}
