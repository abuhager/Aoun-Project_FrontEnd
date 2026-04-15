"use client";
import { useEffect } from "react";

interface ToastProps {
  msg: string;
  type: "error" | "success";
  onClose: () => void;
}

export function Toast({ msg, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-3 ${
        type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
      }`}
    >
      <span>{msg}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}