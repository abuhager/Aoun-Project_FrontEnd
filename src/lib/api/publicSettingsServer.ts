import 'server-only';

import { cache } from 'react';
import { getPublicSettings } from '@/lib/api/settingsApi';

export const getServerPublicSettings = cache(getPublicSettings);
