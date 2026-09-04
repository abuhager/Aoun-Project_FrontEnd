type DonationRequestFiltersProps = {
  myOnly: boolean;
  categories: string[];
  locations: string[];
  selectedCategory: string;
  selectedLocation: string;
  onShowAll: () => void;
  onShowMine: () => void;
  onCategoryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
};

export default function DonationRequestFilters({
  myOnly,
  categories,
  locations,
  selectedCategory,
  selectedLocation,
  onShowAll,
  onShowMine,
  onCategoryChange,
  onLocationChange,
}: DonationRequestFiltersProps) {
  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-xs font-black transition-colors ${
      active
        ? "bg-primary text-white shadow-sm"
        : "bg-[#f3f1ec] text-[#6b655e] hover:bg-[#ece7df]"
    }`;

  return (
    <section className="content-panel p-4 md:p-5" aria-label="فلترة طلبات التبرع">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="نطاق الطلبات">
          <button type="button" onClick={onShowAll} className={tabClass(!myOnly)}>
            كل الطلبات
          </button>
          <button type="button" onClick={onShowMine} className={tabClass(myOnly)}>
            طلباتي فقط
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            aria-label="فلترة حسب التصنيف"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="field-control min-h-11 px-4 py-2.5 text-xs font-black sm:min-w-44"
          >
            <option value="">كل التصنيفات</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            aria-label="فلترة حسب المنطقة"
            value={selectedLocation}
            onChange={(event) => onLocationChange(event.target.value)}
            className="field-control min-h-11 px-4 py-2.5 text-xs font-black sm:min-w-44"
          >
            <option value="">كل المناطق</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
