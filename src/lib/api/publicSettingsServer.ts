import 'server-only';

import { cache } from 'react';
import { getPublicSettingsServer } from '@/lib/api/publicApiServer';

export const getServerPublicSettings = cache(async () => {
  try {
    return await getPublicSettingsServer();
  } catch {
    return null;
  }
});
