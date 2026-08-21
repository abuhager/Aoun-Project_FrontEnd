"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser, UserRole, TrustLevel } from "@/types/user.types";
import { getSafeRedirectPath } from "@/config/routes";
import { login } from "@/lib/api/authApi";

interface FormData {
  email:    string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  msg:         string;
  user: {
    _id?:               string;
    id?:                string;
    name:               string;
    email:              string;
    avatar?:            string;
    role:               string;
    trustLevel?:        TrustLevel;
    quota?:             number;
    isVerified?:        boolean;
    isVerifiedStudent?: boolean;
    phoneVerified?:     boolean;
    isFrozen?:          boolean;
    isBanned?:          boolean;
    createdAt?:         string;
    gamification?: {
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
  msg?:   string;
  code?:  string;
  email?: string;
}

export function useLogin() {
  const router      = useRouter();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setFormData({ email, password });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await login({
        email:    formData.email,
        password: formData.password,
      });

      const { user } = response as LoginResponse;

      const safeLevel = ([1, 2] as TrustLevel[]).includes(
        user.trustLevel as TrustLevel
      )
        ? (user.trustLevel as TrustLevel)
        : 1;

      const authUser: AuthUser = {
        _id:               user._id ?? user.id ?? "",
        name:              user.name,
        email:             user.email,
        avatar:            user.avatar ?? "",
        role:              user.role as UserRole,
        trustLevel:        safeLevel,
        quota:             user.quota ?? 0,
        isVerified:        user.isVerified ?? false,
        isVerifiedStudent: user.isVerifiedStudent ?? false,
        phoneVerified:     user.phoneVerified ?? false,
        isFrozen:          user.isFrozen ?? false,
        isBanned:          user.isBanned ?? false,
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

      const params   = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");

      window.location.replace(getSafeRedirectPath(redirect));
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorResponse>(err)) {
        const errorData = err.response?.data;

        // ✅ إصلاح #1: الـ code الصحيح هو 'EMAIL_NOT_VERIFIED' وليس 'NOT_VERIFIED'
        if (errorData?.code === "EMAIL_NOT_VERIFIED") {
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

  return {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit,
    fillDemoCredentials,
  };
}
