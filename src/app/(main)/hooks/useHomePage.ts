import { useState, useEffect } from "react";
import axiosInstance from "@/lib/api/axiosInstance";

export interface Item {
  _id:        string;
  title:      string;
  imageUrl?:  string;
  image?:     string;
  category?:  string;
  location?:  string;
  createdAt:  string;
}

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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

  const [items,   setItems]   = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // ✅ Public endpoint — لا token مطلوب
        const res = await axiosInstance.get("/api/items");
        setItems(res.data.items ?? []);
      } catch {
        // صامت — الصفحة الرئيسية لا يجب أن تكسر بسبب API 
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [apiUrl]);

  const getImageUrl = (item: Item) => {
    const raw = item.imageUrl || item.image;
    if (!raw) return "/placeholder.png";
    return raw.startsWith("http") ? raw : `${apiUrl}/${raw}`;
  };

  return { items: items.slice(0, 4), loading, getImageUrl };
}
