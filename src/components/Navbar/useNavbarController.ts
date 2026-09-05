"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { SOCKET_EVENTS } from "@/config/socket";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useSocket } from "@/context/SocketContext";
import { getConversationUnreadCount } from "@/lib/api/conversationApi";
import { useNavbar } from "./useNavbar";

const NAV_LINKS = [
  { href: "/browse", icon: "explore", label: "تصفح الأغراض", authRequired: false },
  { href: "/donation-requests", icon: "volunteer_activism", label: "طلبات التبرع", authRequired: false },
  { href: "/hubs", icon: "warehouse", label: "مراكز التسليم", authRequired: false },
  { href: "/#how-it-works", icon: "help", label: "كيف نعمل؟", authRequired: false },
  { href: "/leaderboard", icon: "leaderboard", label: "المتصدرون", authRequired: true },
] as const;

export function useNavbarController() {
  const { platformName } = useSiteConfig();
  const { socket } = useSocket();
  const navbar = useNavbar();
  const {
    pathname,
    isLoggedIn,
    isMounted,
    userRole,
    user,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
  } = navbar;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null);
  const profileMenuId = useId();
  const mobileMenuId = useId();
  const [chatOpen, setChatOpen] = useState(false);
  const [requestedConversationId, setRequestedConversationId] = useState<string | null>(null);
  const [serverChatUnreadCount, setServerChatUnreadCount] = useState(0);

  const isReadyForUserData = isMounted && isLoggedIn;
  const isAdmin =
    isReadyForUserData && (userRole === "admin" || userRole === "super_admin");
  const userLevel = user?.gamification?.level ?? 1;
  const userBadge = (user?.gamification as { badge?: string })?.badge ?? "🌱";
  const chatUnreadCount = isReadyForUserData ? serverChatUnreadCount : 0;
  const visibleLinks = useMemo(
    () => NAV_LINKS.filter((link) => !link.authRequired || isReadyForUserData),
    [isReadyForUserData]
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      return await getConversationUnreadCount();
    } catch {
      return 0;
    }
  }, []);

  useEffect(() => {
    if (!isReadyForUserData) return;
    let cancelled = false;
    fetchUnreadCount()
      .then((total) => {
        if (!cancelled) setServerChatUnreadCount(total);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setServerChatUnreadCount(0);
        let message = "";
        if (error && typeof error === "object") {
          if ("message" in error) message = String(error.message);
          else if ("code" in error) message = String(error.code);
        }
        if (message !== "NOT_AUTHENTICATED" && message !== "AUTH_INIT_TIMEOUT") {
          console.error("fetch navbar unread count error", error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchUnreadCount, isReadyForUserData]);

  useEffect(() => {
    if (!socket || !isReadyForUserData) return;
    const handleRefresh = () => {
      void fetchUnreadCount().then(setServerChatUnreadCount);
    };
    const resyncAfterReconnect = () => {
      if (!socket.recovered) handleRefresh();
    };
    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, handleRefresh);
    socket.on(SOCKET_EVENTS.MESSAGES_READ, handleRefresh);
    socket.on("connect", resyncAfterReconnect);
    return () => {
      socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED, handleRefresh);
      socket.off(SOCKET_EVENTS.MESSAGES_READ, handleRefresh);
      socket.off("connect", resyncAfterReconnect);
    };
  }, [fetchUnreadCount, isReadyForUserData, socket]);

  useEffect(() => {
    if (!isReadyForUserData) return;
    const openRequestedConversation = (event: Event) => {
      const conversationId = (event as CustomEvent<{ conversationId?: unknown }>).detail
        ?.conversationId;
      if (typeof conversationId !== "string" || !/^[a-f\d]{24}$/i.test(conversationId)) return;
      setRequestedConversationId(conversationId);
      setChatOpen(true);
    };
    window.addEventListener("aoun:open-conversation", openRequestedConversation);
    return () => window.removeEventListener("aoun:open-conversation", openRequestedConversation);
  }, [isReadyForUserData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileDropdownOpen, setIsProfileDropdownOpen]);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsProfileDropdownOpen(false);
      profileButtonRef.current?.focus();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isProfileDropdownOpen, setIsProfileDropdownOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const menuButton = mobileMenuButtonRef.current;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      mobileMenuPanelRef.current
        ?.querySelector<HTMLElement>("a[href], button:not([disabled])")
        ?.focus({ preventScroll: true });
    });
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus({ preventScroll: true });
    };
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  const isNavLinkActive = (href: string) =>
    !href.startsWith("/#") &&
    (pathname === href || pathname.startsWith(`${href}/`));

  return {
    ...navbar,
    platformName,
    dropdownRef,
    profileButtonRef,
    mobileMenuButtonRef,
    mobileMenuPanelRef,
    profileMenuId,
    mobileMenuId,
    chatOpen,
    requestedConversationId,
    isReadyForUserData,
    isAdmin,
    userLevel,
    userBadge,
    chatUnreadCount,
    visibleLinks,
    isNavLinkActive,
    openChatInbox: () => {
      setRequestedConversationId(null);
      setChatOpen(true);
    },
    closeChat: () => {
      setChatOpen(false);
      setRequestedConversationId(null);
    },
    setServerChatUnreadCount,
  };
}

export type NavbarController = ReturnType<typeof useNavbarController>;
