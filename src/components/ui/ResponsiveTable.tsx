import type { ReactNode } from "react";

interface ResponsiveTableProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export default function ResponsiveTable({
  label,
  children,
  className = "",
}: ResponsiveTableProps) {
  return (
    <div className={className}>
      <p className="responsive-table-hint" aria-hidden="true">
        مرّر أفقياً لعرض جميع أعمدة الجدول
      </p>
      <div
        className="responsive-table-scroll"
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
