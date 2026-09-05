"use client";

import NotificationButton from "./notifications/NotificationButton";
import NotificationPanel from "./notifications/NotificationPanel";
import { useNotificationBellController } from "./notifications/useNotificationBellController";

export default function NotificationBell() {
  const {
    rootRef,
    buttonRef,
    panelId,
    isOpen,
    unreadCount,
    toggleOpen,
    notifications,
    totalCount,
    hasMore,
    isLoading,
    error,
    refresh,
    handleMarkAllRead,
    handleNotificationClick,
  } = useNotificationBellController();

  return (
    <div ref={rootRef} className="relative">
      <NotificationButton
        buttonRef={buttonRef}
        panelId={panelId}
        isOpen={isOpen}
        unreadCount={unreadCount}
        toggleOpen={toggleOpen}
      />
      {isOpen && (
        <NotificationPanel
          panelId={panelId}
          notifications={notifications}
          unreadCount={unreadCount}
          totalCount={totalCount}
          hasMore={hasMore}
          isLoading={isLoading}
          error={error}
          refresh={refresh}
          handleMarkAllRead={handleMarkAllRead}
          handleNotificationClick={handleNotificationClick}
        />
      )}
      <style>{`
        @keyframes badgePop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
