import type { ChangeEvent } from "react";

interface RegisterPasswordFieldProps {
  id: string;
  name: "password" | "confirmPassword";
  label: string;
  value: string;
  visible: boolean;
  icon: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
}

export default function RegisterPasswordField({ id, name, label, value, visible, icon, onChange, onToggle }: RegisterPasswordFieldProps) {
  return <div><label htmlFor={id} className="mb-2 block text-xs font-black text-on-surface-variant">{label}</label><div className="relative"><span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft">{icon}</span><input id={id} name={name} type={visible ? "text" : "password"} required dir="ltr" autoComplete="new-password" value={value} onChange={onChange} placeholder="••••••••" className="field-control px-11 text-left text-sm font-bold placeholder:text-on-surface-soft/70" /><button type="button" onClick={onToggle} aria-label={visible ? `إخفاء ${label}` : `إظهار ${label}`} aria-pressed={visible} className="touch-target absolute left-0 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-soft hover:text-primary"><span aria-hidden="true" className="material-symbols-outlined text-[19px]">{visible ? "visibility_off" : "visibility"}</span></button></div></div>;
}
