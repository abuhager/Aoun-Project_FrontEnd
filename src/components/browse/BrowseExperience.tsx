"use client";

import BrowseFilters from "@/components/browse/BrowseFilters";
import BrowseResults from "@/components/browse/BrowseResults";
import { useBrowseExperience } from "@/components/browse/useBrowseExperience";
import type { BrowseValues } from "@/components/browse/useBrowseExperience";
import type { ItemsListResponse } from "@/types/item.types";

type BrowseExperienceProps = {
  initialResult: ItemsListResponse | null;
  initialValues: BrowseValues;
  categories: string[];
  locations: string[];
};

export default function BrowseExperience({
  initialResult,
  initialValues,
  categories,
  locations,
}: BrowseExperienceProps) {
  const browse = useBrowseExperience({ initialResult, initialValues });

  return (
    <>
      <BrowseFilters
        categories={categories}
        locations={locations}
        searchQuery={browse.searchQuery}
        selectedCategory={browse.selectedCategory}
        selectedLocation={browse.selectedLocation}
        loading={browse.loading}
        total={browse.total}
        hasActiveFilters={browse.hasActiveFilters}
        onSearchChange={browse.setSearchQuery}
        onLocationChange={browse.changeLocation}
        onCategoryChange={browse.changeCategory}
        onClearSearch={browse.clearSearch}
        onClearFilters={browse.clearFilters}
      />

      <BrowseResults
        items={browse.items}
        loading={browse.loading}
        error={browse.error}
        total={browse.total}
        currentPage={browse.currentPage}
        totalPages={browse.totalPages}
        hasActiveFilters={browse.hasActiveFilters}
        returnTo={browse.browseReturnTo}
        onPageChange={browse.setCurrentPage}
        onRetry={browse.retry}
        onClearFilters={browse.clearFilters}
      />
    </>
  );
}
