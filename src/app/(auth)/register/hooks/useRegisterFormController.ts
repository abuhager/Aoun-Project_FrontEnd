"use client";

import { useState } from "react";
import { useRegister } from "./useRegister";

const JORDAN_PHONE_REGEX = /^(77|78|79)\d{7}$/;

export function useRegisterFormController() {
  const registration = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const phoneTouched = registration.formData.phone.length > 0;
  const phoneValid = JORDAN_PHONE_REGEX.test(registration.formData.phone);
  const phoneError = phoneTouched && !phoneValid;
  const phoneBorderClass = phoneError
    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
    : phoneValid
      ? "border-green-500 focus:border-green-600 focus:ring-4 focus:ring-green-100"
      : "";

  return {
    ...registration,
    showPassword,
    showConfirmPassword,
    phoneValid,
    phoneError,
    phoneBorderClass,
    togglePassword: () => setShowPassword((value) => !value),
    toggleConfirmPassword: () => setShowConfirmPassword((value) => !value),
  };
}

export type RegisterFormController = ReturnType<typeof useRegisterFormController>;
