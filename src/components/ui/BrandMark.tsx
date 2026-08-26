interface BrandMarkProps {
  name: string;
  inverted?: boolean;
  compact?: boolean;
  tagline?: string;
}

export default function BrandMark({
  name,
  inverted = false,
  compact = false,
  tagline = "العطاء أقرب",
}: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-[13px] ${
          compact ? "h-9 w-9" : "h-10 w-10"
        } ${
          inverted
            ? "border border-white/15 bg-white/10 text-white"
            : "bg-primary text-white shadow-[0_9px_22px_rgba(0,97,85,0.2)]"
        }`}
      >
        <span
          className="material-symbols-outlined text-[21px]"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
        >
          volunteer_activism
        </span>
      </span>

      <span className="leading-none">
        <span
          className={`block font-headline text-xl font-black tracking-tight ${
            inverted ? "text-white" : "text-on-surface"
          }`}
        >
          {name}
        </span>
        {!compact && (
          <span
            className={`mt-1 block text-[10px] font-bold ${
              inverted ? "text-white/55" : "text-on-surface-soft"
            }`}
          >
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}
