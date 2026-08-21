export const PASSWORD_REQUIREMENTS_MESSAGE =
  "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي حرفاً كبيراً وصغيراً ورقماً";

export const isStrongPassword = (password: string): boolean =>
  password.length >= 8 &&
  password.length <= 128 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password);
