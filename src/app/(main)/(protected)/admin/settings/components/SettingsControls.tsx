"use client";

import { useState, type ReactNode } from "react";

export function SectionCard({
  icon,
  title,
  subtitle,
  iconTone = "bg-[#eef6f5] text-primary",
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  iconTone?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-[#e8e2d9] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="border-b border-[#f2ede6] bg-[#fcfaf7] px-5 py-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconTone}`}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
          <div>
            <h2 className="text-sm font-black text-[#223433]">{title}</h2>
            {subtitle && <p className="mt-1 text-xs leading-6 text-[#8c857d]">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-[28px] border border-[#e8e2d9] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div className="mt-7">
        <p className="text-2xl font-black leading-none tracking-tight text-[#1f312f]">{value}</p>
        <p className="mt-2 text-sm font-bold text-[#7a746d]">{label}</p>
      </div>
    </div>
  );
}

export function FieldShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[#eee8e0] bg-[#fcfaf7] p-4 transition-all hover:border-primary/15 hover:bg-white ${className}`}>
      {children}
    </div>
  );
}

export function TagListEditor({
  label,
  items = [],
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const value = input.trim();
    if (!value || items.includes(value)) return;
    onChange([...items, value]);
    setInput("");
  };

  const remove = (item: string) => onChange(items.filter((value) => value !== item));

  return (
    <div className="space-y-3">
      <label className="text-xs font-black text-[#5f5953]">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-2xl border border-[#e7e1d8] bg-white px-4 py-3 text-sm text-[#24302f] outline-none transition-all placeholder:text-[#b3aba1] focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-2xl bg-primary px-5 py-3 text-xs font-black text-white hover:bg-primary/90"
        >
          إضافة
        </button>
      </div>

      <div className="flex min-h-[44px] flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-[#ebe5dc] bg-[#f5f1eb] px-3 py-1.5 text-xs font-bold text-[#605a54]">
            {item}
            <button
              type="button"
              onClick={() => remove(item)}
              aria-label={`حذف ${item}`}
              className="text-[#aaa298] hover:text-red-500"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs italic text-[#b3aba1]">لا يوجد عناصر</span>}
      </div>
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  hint?: string;
}) {
  const [local, setLocal] = useState(String(value));

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setLocal(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
    setLocal(String(clamped));
  };

  return (
    <FieldShell>
      <div className="space-y-2">
        <label className="text-xs font-black text-[#5f5953]">{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          value={local}
          onChange={(event) => setLocal(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit(event.currentTarget.value);
          }}
          className="w-full rounded-2xl border border-[#e7e1d8] bg-white px-4 py-3 text-sm text-[#24302f] outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgba(1,105,111,0.08)]"
        />
        {hint && <p className="text-[11px] leading-5 text-[#9f978e]">{hint}</p>}
      </div>
    </FieldShell>
  );
}

export function Toggle({
  checked,
  onChange,
  activeColor = "bg-primary",
}: {
  checked: boolean;
  onChange: () => void;
  activeColor?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-7 w-14 rounded-full transition-all ${checked ? activeColor : "bg-[#ddd7cf]"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all ${checked ? "right-1" : "left-1"}`} />
    </button>
  );
}
