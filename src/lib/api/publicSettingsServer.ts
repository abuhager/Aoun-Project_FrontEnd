import 'server-only';

import { cache } from 'react';
import { getPublicSettings } from '@/lib/api/publicSettingsApi';

export const getServerPublicSettings = cache(async () => {
  try {
    return await getPublicSettings();
  } catch {
    return null;
  }
});
