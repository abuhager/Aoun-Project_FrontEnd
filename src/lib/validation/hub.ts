import type {
  HubCoordinates,
} from "@/types/hub.types";

export const DEFAULT_HUB_WORKING_HOURS = "9:00 ص — 5:00 م";

export interface HubFormValues {
  name: string;
  address: string;
  city: string;
  workingHours: string;
  lat: string;
  lng: string;
}

interface HubFormPayload {
  name: string;
  address: string;
  city: string;
  workingHours: string;
  coordinates?: HubCoordinates | null;
}

export interface HubFormResult {
  errors: string[];
  payload: HubFormPayload | null;
}

const validateLength = (
  value: string,
  label: string,
  min: number,
  max: number,
  errors: string[]
) => {
  if (!value) {
    errors.push(`${label} مطلوب`);
  } else if (value.length < min || value.length > max) {
    errors.push(`${label} يجب أن يكون بين ${min} و${max} حرفاً`);
  }
};

export function buildHubPayload(
  form: HubFormValues,
  { clearExistingCoordinates = false } = {}
): HubFormResult {
  const errors: string[] = [];
  const name = form.name.trim();
  const address = form.address.trim();
  const city = form.city.trim();
  const workingHours = form.workingHours.trim() || DEFAULT_HUB_WORKING_HOURS;

  validateLength(name, "اسم المركز", 3, 100, errors);
  validateLength(address, "العنوان", 3, 200, errors);
  validateLength(city, "المدينة", 2, 60, errors);
  if (workingHours.length > 100) {
    errors.push("ساعات العمل يجب ألا تتجاوز 100 حرف");
  }

  const latText = form.lat.trim();
  const lngText = form.lng.trim();
  let coordinates: HubCoordinates | null | undefined;

  if (Boolean(latText) !== Boolean(lngText)) {
    errors.push("أدخل خط العرض وخط الطول معاً أو اتركهما فارغين");
  } else if (latText && lngText) {
    const lat = Number(latText);
    const lng = Number(lngText);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      errors.push("خط العرض يجب أن يكون رقماً بين -90 و90");
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      errors.push("خط الطول يجب أن يكون رقماً بين -180 و180");
    }

    if (errors.length === 0) coordinates = { lat, lng };
  } else if (clearExistingCoordinates) {
    coordinates = null;
  }

  if (errors.length > 0) return { errors, payload: null };

  return {
    errors,
    payload: {
      name,
      address,
      city,
      workingHours,
      ...(coordinates !== undefined ? { coordinates } : {}),
    },
  };
}
