"use client";

import { useState, useRef, useEffect } from "react";
import axiosInstance from "@/lib/api/axiosInstance";

interface UseDeliveryConfirmationProps {
  itemId: string;
  userRole: "donor" | "recipient";
  initialRecipientConfirmed: boolean;
  onSuccess?: (itemId: string) => void;
}

export function useDeliveryConfirmation({
  itemId,
  userRole,
  initialRecipientConfirmed,
  onSuccess,
}: UseDeliveryConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecipientConfirmed, setIsRecipientConfirmed] = useState(initialRecipientConfirmed);
  const isMountedRef = useRef(true);

  // مزامنة الـ State الداخلي لو تغير الـ item من الخارج
  useEffect(() => {
    setIsRecipientConfirmed(initialRecipientConfirmed);
  }, [initialRecipientConfirmed]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 📦 تأكيد المستلم (تأكيد استلام الغرض عيناً)
  const confirmReceipt = async () => {
    if (!itemId || isLoading) return;
    setIsLoading(true);

    try {
      // ضرب الـ Route الموحد والجديد في الـ Backend عندك
      const response = await axiosInstance.post(`/api/items/${itemId}/confirm-receipt`);
      
      if (isMountedRef.current) {
        setIsRecipientConfirmed(true);
        setIsLoading(false); // 🌟 إغلاق الـ Loading فوراً فور النجاح
        
        if (onSuccess) {
          onSuccess(itemId);
        }
      }
    } catch (error) {
      console.error("❌ خطأ أثناء تأكيد الاستلام:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false); // 🌟 ضمان إغلاق الـ Loading حتى لو فشل الطلب
      }
    }
  };

  // 🚚 تأكيد المتبرع (تأكيد تسليم الغرض للمستلم)
  const confirmDelivery = async () => {
    if (!itemId || isLoading) return;
    setIsLoading(true);

    try {
      await axiosInstance.post(`/api/items/${itemId}/confirm-delivery`);
      
      if (isMountedRef.current) {
        setIsLoading(false);
        if (onSuccess) {
          onSuccess(itemId);
        }
      }
    } catch (error) {
      console.error("❌ خطأ أثناء تأكيد التسليم:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return {
    isLoading,
    isRecipientConfirmed,
    confirmReceipt,
    confirmDelivery,
  };
}