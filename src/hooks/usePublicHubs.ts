"use client";

import useSWR from 'swr';
import {
  getHubs,
  PUBLIC_HUBS_CACHE_KEY,
} from '@/lib/api/hubApi';
import type { SafeHub } from '@/types/hub.types';

export function usePublicHubs() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<SafeHub[]>(
    PUBLIC_HUBS_CACHE_KEY,
    () => getHubs()
  );

  return {
    hubs: data ?? [],
    error,
    isLoading,
    isValidating,
    refresh: mutate,
  };
}
