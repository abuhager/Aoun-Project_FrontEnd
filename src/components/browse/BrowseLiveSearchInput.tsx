import { needsMoreBrowseSearchCharacters } from "@/lib/navigation/browseSearch";

export default function BrowseLiveSearchInput({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const needsMoreCharacters = needsMoreBrowseSearchCharacters(value);

  return (
    <label className="block md:col-span-6">
      <span className="mb-2 block text-xs font-black text-on-surface-variant">
        ماذا تبحث عنه؟
      </span>
      <span className="relative block">
        <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-soft">
          search
        </span>
        <input
          type="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          maxLength={100}
          autoComplete="off"
          aria-describedby="browse-search-hint"
          placeholder="مثال: كرسي مكتب أو كتب جامعية"
          className="field-control px-4 pr-11 text-sm font-bold placeholder:font-medium placeholder:text-on-surface-soft/70"
        />
      </span>
      <span
        id="browse-search-hint"
        className={`mt-1.5 block min-h-5 text-[11px] font-bold ${
          needsMoreCharacters ? "text-primary" : "text-transparent"
        }`}
        aria-live="polite"
      >
        {needsMoreCharacters ? "اكتب حرفًا إضافيًا لبدء البحث." : "\u00a0"}
      </span>
    </label>
  );
}
