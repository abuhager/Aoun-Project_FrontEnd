"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import axiosInstance, { setAccessToken } from "@/lib/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser, UserRole } from "@/types/user.types";

interface FormData {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  msg:         string;
  user: {
    _id?:              string;
    id?:               string;
    name:              string;
    email:             string;
    avatar?:           string;
    role:              string;
    trustLevel?:       1 | 2;
    quota?:            number;
    isVerified?:       boolean;
    isVerifiedStudent?: boolean;
    createdAt?:        string;
    gamification?: {              // ✅ أضف
      trustScore:     number;
      totalDonations: number;
      level:          number;
      title:          string;
      badge:          string;
      progress:       number;
      pointsToNext:   number | null;
    };
  };
}
interface ErrorResponse {
  msg?: string;
  code?: string;
  email?: string;
}

export function useLogin() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await axiosInstance.post<LoginResponse>("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { accessToken, user } = res.data;

      setAccessToken(accessToken);

    const authUser: AuthUser = {
  _id:               user._id ?? user.id ?? "",
  name:              user.name,
  email:             user.email,
  avatar:            user.avatar ?? "",
  role:              user.role as UserRole,
  trustLevel:        (user.trustLevel as 1 | 2) ?? 1,
  quota:             user.quota ?? 0,
  isVerified:        user.isVerified ?? false,
  isVerifiedStudent: user.isVerifiedStudent ?? false,
  createdAt:         user.createdAt ?? "",
  gamification: {
    trustScore:     user.gamification?.trustScore     ?? 0,
    totalDonations: user.gamification?.totalDonations ?? 0,
    level:          user.gamification?.level          ?? 1,
    title:          user.gamification?.title          ?? "مبتدئ",
    badge:          user.gamification?.badge          ?? "🌱",
    progress:       user.gamification?.progress       ?? 0,
    pointsToNext:   user.gamification?.pointsToNext   ?? null,
  },
};
      setUser(authUser);

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");

      window.location.replace(
        redirect && redirect !== "/login" ? redirect : "/browse"
      );
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorResponse>(err)) {
        const errorData = err.response?.data;

        if (errorData?.code === "NOT_VERIFIED") {
          const targetEmail = errorData.email || formData.email;
          router.push(`/verify?email=${encodeURIComponent(targetEmail)}`);
          return;
        }

        setError(errorData?.msg || "حدث خطأ غير متوقع");
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  return { formData, error, loading, handleChange, handleSubmit };
}