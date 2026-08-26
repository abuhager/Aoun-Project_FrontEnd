import type { ReactNode } from "react";

type PageIntroTone = "brand" | "ink" | "warm" | "admin";

interface PageIntroProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  icon: string;
  actions?: ReactNode;
  meta?: ReactNode;
  tone?: PageIntroTone;
  compact?: boolean;
  className?: string;
}

export default function PageIntro({
  eyebrow,
  title,
  description,
  icon,
  actions,
  meta,
  tone = "brand",
  compact = false,
  className = "",
}: PageIntroProps) {
  return (
    <section
      className={`route-intro route-intro--${tone} ${compact ? "route-intro--compact" : ""} ${className}`.trim()}
    >
      <span aria-hidden="true" className="route-intro__orb route-intro__orb--one" />
      <span aria-hidden="true" className="route-intro__orb route-intro__orb--two" />

      <div className="route-intro__content">
        <div className="route-intro__copy">
          <span className="route-intro__icon" aria-hidden="true">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            >
              {icon}
            </span>
          </span>

          <div className="min-w-0">
            <p className="route-intro__eyebrow">{eyebrow}</p>
            <h1 className="route-intro__title">{title}</h1>
            {description && (
              <div className="route-intro__description">{description}</div>
            )}
          </div>
        </div>

        {actions && <div className="route-intro__actions">{actions}</div>}
      </div>

      {meta && <div className="route-intro__meta">{meta}</div>}
    </section>
  );
}
