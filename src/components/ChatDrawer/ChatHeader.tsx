"use client";

import Image from "next/image";

interface ChatHeaderProps {
  itemTitle: string;
  participantName: string;
  participantAvatar?: string;
  isJoined: boolean;
  onClose: () => void;
  onBack?: () => void;
  showClose: boolean;
}

export default function ChatHeader({ itemTitle, participantName, participantAvatar, isJoined, onClose, onBack, showClose }: ChatHeaderProps) {
  return (
    <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-black/[0.08] bg-white px-4 sm:px-5">
      {onBack && (
        <button type="button" onClick={onBack} aria-label="العودة إلى قائمة المحادثات" className="touch-target -mr-2 flex shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low lg:hidden">
          <span className="material-symbols-outlined text-[21px]">arrow_forward</span>
        </button>
      )}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-sm font-black text-primary-container">
        {participantAvatar ? <Image src={participantAvatar} alt="" fill sizes="44px" className="object-cover" /> : <span>{participantName[0] || "م"}</span>}
        <span aria-label={isJoined ? "متصل" : "غير متصل"} className={`absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-white ${isJoined ? "bg-emerald-500" : "bg-gray-300"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[14px] font-black text-on-surface sm:text-[15px]">{participantName}</h2>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-on-surface-soft">
          <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[14px] text-primary">inventory_2</span>
          <span className="truncate">{itemTitle}</span>
        </p>
      </div>
      <span className={`hidden items-center gap-1.5 text-[10px] font-bold sm:flex ${isJoined ? "text-emerald-700" : "text-on-surface-soft"}`}>
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${isJoined ? "bg-emerald-500" : "bg-gray-300"}`} />
        {isJoined ? "متصل" : "غير متصل"}
      </span>
      {showClose && (
        <button type="button" aria-label="إغلاق المحادثة" onClick={onClose} className="touch-target -ml-2 flex shrink-0 items-center justify-center rounded-lg text-on-surface-soft hover:bg-surface-container-low hover:text-on-surface">
          <span className="material-symbols-outlined text-[21px]">close</span>
        </button>
      )}
    </header>
  );
}
