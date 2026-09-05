"use client";

import Link from "next/link";
import { EditProfileHeader } from "./components/EditProfileHeader";
import { ProfileForms } from "./components/ProfileForms";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { useEditProfile } from "./hooks/useEditProfile";

export default function EditProfileClient() {
  const profile = useEditProfile();

  if (!profile.isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="جاري تحميل الحساب">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="page-shell pb-16 pt-20" dir="rtl">
      <div className="site-container space-y-6 md:pt-4">
        <Link href="/dashboard" className="group inline-flex items-center gap-1.5 text-sm font-bold text-on-surface-variant transition-colors hover:text-primary">
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
          العودة للوحة التحكم
        </Link>

        <EditProfileHeader {...profile} />

        <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <ProfileSidebar activeTab={profile.activeTab} selectTab={profile.selectTab} />
          <ProfileForms {...profile} />
        </div>
      </div>
    </div>
  );
}
