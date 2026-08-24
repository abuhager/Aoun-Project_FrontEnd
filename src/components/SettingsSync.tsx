"use client";

import { useCallback, useEffect } from "react";
import { mutate } from "swr";
import { SOCKET_EVENTS } from "@/config/socket";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useSocket } from "@/context/SocketContext";
import {
  getPublicSettings,
  PUBLIC_SETTINGS_CACHE_KEY,
} from "@/lib/api/publicSettingsApi";
import type { PublicSettings } from "@/types/settings.types";

export default function SettingsSync() {
  const { socket } = useSocket();
  const { applyPublicSettings } = useSiteConfig();

  const applySettings = useCallback(
    (settings: PublicSettings) => {
      applyPublicSettings(settings);
      void mutate(PUBLIC_SETTINGS_CACHE_KEY, settings, { revalidate: false });
    },
    [applyPublicSettings]
  );

  const refreshSettings = useCallback(async () => {
    try {
      applySettings(await getPublicSettings());
    } catch {
      // تبقى آخر إعدادات سليمة، ويعيد SWR أو اتصال Socket المزامنة لاحقاً.
    }
  }, [applySettings]);

  useEffect(() => {
    if (!socket) return;

    const onSettingsUpdated = (settings: PublicSettings) => applySettings(settings);
    const onConnect = () => {
      if (!socket.recovered) void refreshSettings();
    };

    socket.on(SOCKET_EVENTS.SETTINGS_UPDATED, onSettingsUpdated);
    socket.on("connect", onConnect);

    return () => {
      socket.off(SOCKET_EVENTS.SETTINGS_UPDATED, onSettingsUpdated);
      socket.off("connect", onConnect);
    };
  }, [applySettings, refreshSettings, socket]);

  return null;
}
