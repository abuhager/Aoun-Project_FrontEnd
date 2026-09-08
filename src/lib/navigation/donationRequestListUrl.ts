export type DonationRequestListState = {
  mine: boolean;
  category: string;
  location: string;
  page: number;
};

const normalizePage = (value: string | null): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

export const readDonationRequestListState = (
  searchParams: Pick<URLSearchParams, "get">
): DonationRequestListState => ({
  mine: searchParams.get("mine") === "true",
  category: searchParams.get("category")?.trim() ?? "",
  location: searchParams.get("location")?.trim() ?? "",
  page: normalizePage(searchParams.get("page")),
});

export const buildDonationRequestListUrl = (
  state: DonationRequestListState
): string => {
  const params = new URLSearchParams();
  if (state.mine) params.set("mine", "true");
  if (state.category) params.set("category", state.category);
  if (state.location) params.set("location", state.location);
  if (state.page > 1) params.set("page", String(Math.floor(state.page)));
  const query = params.toString();
  return query ? `/donation-requests?${query}` : "/donation-requests";
};
