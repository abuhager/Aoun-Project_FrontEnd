export const MIN_BROWSE_SEARCH_LENGTH = 2;
export const MAX_BROWSE_SEARCH_LENGTH = 100;

export const normalizeBrowseSearchInput = (value: string) =>
  value.trim().slice(0, MAX_BROWSE_SEARCH_LENGTH);

export const isBrowseSearchReady = (value: string) =>
  normalizeBrowseSearchInput(value).length >= MIN_BROWSE_SEARCH_LENGTH;

export const getBrowseSearchRequestValue = (value: string) => {
  const normalized = normalizeBrowseSearchInput(value);
  return normalized.length >= MIN_BROWSE_SEARCH_LENGTH ? normalized : "";
};

export const needsMoreBrowseSearchCharacters = (value: string) => {
  const length = normalizeBrowseSearchInput(value).length;
  return length > 0 && length < MIN_BROWSE_SEARCH_LENGTH;
};
