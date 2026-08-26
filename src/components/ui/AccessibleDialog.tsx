"use client";

import {
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

interface AccessibleDialogProps {
  ariaLabel: string;
  children: ReactNode;
  onClose?: () => void;
  closeDisabled?: boolean;
  dismissOnBackdrop?: boolean;
  overlayClassName?: string;
  panelClassName?: string;
  panelAs?: "div" | "aside";
  role?: "dialog" | "alertdialog";
  dir?: "rtl" | "ltr";
  ariaBusy?: boolean;
}

/**
 * غلاف حوار موحّد: يحبس التركيز، يعيده لمصدر الفتح، يقفل تمرير الصفحة،
 * ويدعم Escape والخلفية حسب سياسة النافذة.
 */
export default function AccessibleDialog({
  ariaLabel,
  children,
  onClose,
  closeDisabled = false,
  dismissOnBackdrop = true,
  overlayClassName = "fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
  panelClassName = "w-full max-w-md rounded-3xl bg-white shadow-2xl",
  panelAs = "div",
  role = "dialog",
  dir = "rtl",
  ariaBusy = false,
}: AccessibleDialogProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const panelRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const closeDisabledRef = useRef(closeDisabled);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
    closeDisabledRef.current = closeDisabled;
  }, [closeDisabled, onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const preferred = panel.querySelector<HTMLElement>("[data-dialog-initial-focus]");
      const first = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (preferred ?? first ?? panel).focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onCloseRef.current && !closeDisabledRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) =>
        Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
      );

      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [isClient]);

  const Panel = panelAs as ElementType;

  if (!isClient) return null;

  return createPortal(
    <div
      className={overlayClassName}
      dir={dir}
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          dismissOnBackdrop &&
          onClose &&
          !closeDisabled
        ) {
          onClose();
        }
      }}
    >
      <Panel
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-label={ariaLabel}
        aria-busy={ariaBusy || undefined}
        tabIndex={-1}
        className={panelClassName}
      >
        {children}
      </Panel>
    </div>,
    document.body
  );
}
