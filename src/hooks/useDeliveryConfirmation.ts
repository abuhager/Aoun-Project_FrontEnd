"use client";

import { useEffect, useRef, useState } from "react";
import {
  confirmDelivery as confirmDeliveryRequest,
  confirmReceipt as confirmReceiptRequest,
} from "@/lib/api/itemApi";
import { extractErrorMsg } from "@/lib/api/extractErrorMsg";

interface UseDeliveryConfirmationProps {
  itemId: string;
  initialRecipientConfirmed: boolean;
  onSuccess?: (itemId: string) => void | Promise<void>;
  onError?: (message: string) => void;
}

export function useDeliveryConfirmation({
  itemId,
  initialRecipientConfirmed,
  onSuccess,
  onError,
}: UseDeliveryConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecipientConfirmed, setIsRecipientConfirmed] = useState(
    initialRecipientConfirmed
  );
  const isMountedRef = useRef(true);

  useEffect(() => {
    setIsRecipientConfirmed(initialRecipientConfirmed);
  }, [initialRecipientConfirmed]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const confirmReceipt = async () => {
    if (!itemId || isLoading) return;
    setIsLoading(true);
    try {
      await confirmReceiptRequest(itemId);
      if (!isMountedRef.current) return;
      setIsRecipientConfirmed(true);
      await onSuccess?.(itemId);
    } catch (requestError) {
      if (isMountedRef.current) {
        onError?.(extractErrorMsg(requestError, "تعذّر تأكيد الاستلام"));
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  const confirmDelivery = async () => {
    if (!itemId || isLoading || !isRecipientConfirmed) return;
    setIsLoading(true);
    try {
      await confirmDeliveryRequest(itemId);
      if (!isMountedRef.current) return;
      await onSuccess?.(itemId);
    } catch (requestError) {
      if (isMountedRef.current) {
        onError?.(extractErrorMsg(requestError, "تعذّر تأكيد التسليم"));
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  return {
    isLoading,
    isRecipientConfirmed,
    confirmReceipt,
    confirmDelivery,
  };
}
