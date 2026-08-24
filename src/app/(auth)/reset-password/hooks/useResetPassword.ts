"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { resetPassword } from "@/lib/api/authApi";
import { extractErrorMsg } from "@/lib/api/apiError";
import { resetAuthState } from "@/lib/api/axiosInstance";
import { clearSessionCookie } from "@/lib/utils/cookieUtils";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "@/lib/validation/auth";

const RESET_TOKEN_PATTERN = /^[a-f\d]{64}$/i;

export function useResetPassword() {
  const router = useRouter();
  const { setUser } = useAuth();
  const hasReadFragment = useRef(false);

  const [resetToken, setResetToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // React Strict Mode يعيد تشغيل Effects في development. بعد التشغيل الأول
    // نكون قد حذفنا الـfragment للأمان، فلا نفسره ثانية كرابط منتهي.
    if (hasReadFragment.current) return;
    hasReadFragment.current = true;

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const candidate = fragment.get("token") ?? "";

    if (RESET_TOKEN_PATTERN.test(candidate)) {
      setResetToken(candidate);
      // احتفظ بالرمز في ذاكرة React فقط واحذفه من شريط العنوان/History.
      window.history.replaceState(window.history.state, "", "/reset-password");
    } else {
      setError("رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.");
    }
    setTokenReady(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!resetToken) {
      setError("رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين ❌");
      return;
    }
    if (!isStrongPassword(password)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword({ token: resetToken, password });

      resetAuthState();
      clearSessionCookie();
      setUser(null);
      setResetToken(null);
      setMessage(response.msg);
      setIsSuccess(true);

      window.setTimeout(() => router.push("/login"), 3000);
    } catch (requestError: unknown) {
      setError(extractErrorMsg(requestError, "الرابط غير صالح أو انتهت صلاحيته."));
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    !tokenReady
    || !resetToken
    || loading
    || !password
    || !confirmPassword
    || password !== confirmPassword;

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    message,
    error,
    loading,
    isSuccess,
    isDisabled,
    passwordsMatch,
    tokenReady,
    handleSubmit,
  };
}
