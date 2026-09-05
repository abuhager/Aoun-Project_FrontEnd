"use client";

import AuthShell from "@/components/auth/AuthShell";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useRedirectIfAuth } from "../hooks/useRedirectIfAuth";
import RegisterFeedback from "./components/RegisterFeedback";
import RegisterForm from "./components/RegisterForm";
import { useRegisterFormController } from "./hooks/useRegisterFormController";

export default function RegisterClient() {
  useRedirectIfAuth("/browse");
  const { platformName } = useSiteConfig();
  const controller = useRegisterFormController();

  return (
    <AuthShell
      platformName={platformName}
      eyebrow={`انضم إلى ${platformName}`}
      icon="person_add"
      title="إنشاء حساب جديد"
      description="أنشئ حسابك بخطوات واضحة، ثم ابدأ التبرع أو طلب الأغراض بأمان."
      size="wide"
    >
      <RegisterFeedback
        error={controller.error}
        success={controller.success}
        emailAlreadyExists={controller.emailAlreadyExists}
      />
      <RegisterForm {...controller} />
    </AuthShell>
  );
}
