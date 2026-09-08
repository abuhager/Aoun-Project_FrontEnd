"use client";

type BrowseFilterSelectProps = {
  label: string;
  value: string;
  allLabel: string;
  options: string[];
  disabled?: boolean;
  onValueChange: (value: string) => void;
};

export default function BrowseFilterSelect({
  label,
  value,
  allLabel,
  options,
  disabled = false,
  onValueChange,
}: BrowseFilterSelectProps) {
  return (
    <label className="block md:col-span-3">
      <span className="mb-2 block text-xs font-black text-on-surface-variant">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        disabled={disabled}
        className="field-control appearance-none px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-55"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
