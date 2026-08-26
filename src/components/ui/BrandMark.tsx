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
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[15px_6px_15px_15px] ${
          compact ? "h-9 w-9" : "h-11 w-11"
        } ${
          inverted
            ? "border border-white/15 bg-white/10 text-white"
            : "bg-[linear-gradient(145deg,#008b7f,#06433e)] text-white shadow-[0_10px_24px_rgba(0,80,72,0.25)]"
        }`}
      >
        <span className="absolute -bottom-4 -left-3 h-8 w-8 rounded-full bg-white/10" />
        <span
          className="material-symbols-outlined relative text-[21px]"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 550" }}
        >
          volunteer_activism
        </span>
        <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#f3c36f] shadow-[0_0_0_3px_rgba(243,195,111,0.14)]" />
      </span>

      <span className="leading-none">
        <span
          className={`block font-headline text-[1.32rem] font-black tracking-[-0.04em] ${
            inverted ? "text-white" : "text-on-surface"
          }`}
        >
          {name}
        </span>
        {!compact && (
          <span
            className={`mt-1.5 flex items-center gap-1.5 text-[9px] font-extrabold tracking-[0.04em] ${
              inverted ? "text-white/55" : "text-on-surface-soft"
            }`}
          >
            <span className={`h-px w-3 ${inverted ? "bg-[#f3c36f]/70" : "bg-secondary/70"}`} />
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}
