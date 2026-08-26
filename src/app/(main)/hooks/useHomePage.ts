import { useState, useEffect } from "react";
import { getItems } from "@/lib/api/itemApi";
import type { Item } from "@/types/item.types";

type HomeItem = Item & { image?: string };

export const FEATURES = [
  { icon: "person_add",  t: "سجّل حسابك",           d: "انضم لمجتمعنا بخطوات بسيطة وآمنة لحماية خصوصيتك." },
  { icon: "add_box",     t: "أضف غرضاً أو اطلبه",  d: "اعرض ما لا تحتاجه أو تصفح ما يحتاجه الآخرون بكل سهولة." },
  { icon: "handshake",   t: "تم اللقاء والتبادل",   d: "نسّق موعد الاستلام في مكان عام وآمن للجميع." },
  { icon: "star",        t: "قيّم تجربتك",          d: "ساهم في بناء مجتمع الثقة من خلال تقييم التبادل." },
] as const;

export const HIGHLIGHTS = [
  { bg: "bg-secondary",    icon: "school",                  title: "هوية موثقة للطلاب",     desc: "دعم خاص للطلاب من خلال ربط حساباتهم الجامعية الموثقة." },
  { bg: "bg-[#0073b2]",   icon: "account_balance_wallet",  title: "نظام الحصص (Quota)",     desc: "نظام عادل يضمن وصول المساعدات لأكبر عدد ممكن من المستحقين." },
  { bg: "bg-primary",      icon: "verified_user",           title: "مجتمع آمن وموثوق",      desc: "نحرص على التحقق من هوية المستخدمين لضمان تجربة آمنة للجميع." },
] as const;

export function useHomePage() {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  const [items,   setItems]   = useState<HomeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchItems = async () => {
      try {
        const response = await getItems({ limit: 4 }, controller.signal);
        if (!controller.signal.aborted) setItems(response.items ?? []);
      } catch {
        // الصفحة الرئيسية تبقى قابلة للاستخدام عند تعذر تحميل أحدث الأغراض.
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void fetchItems();
    return () => controller.abort();
  }, []);

  const getImageUrl = (item: HomeItem) => {
    const raw = item.imageUrl || item.image;
    if (!raw) return "/placeholder.svg";
    if (raw.startsWith("http")) return raw;
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    return `${apiUrl}${path}`;
  };

  return { items: items.slice(0, 4), loading, getImageUrl };
}
