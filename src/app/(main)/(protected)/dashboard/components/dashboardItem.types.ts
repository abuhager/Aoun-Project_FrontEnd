import type { Item } from "../hooks/useDashboard";
import type { BookedByUser } from "@/types/user.types";

export type DashboardTab = "donations" | "requests";
export type DashboardItem = Item & { reportId?: string | null };

export interface DeliveryState {
  itemId: string | null;
  waitingForDonor: boolean;
}

export interface ItemsTableProps {
  items: DashboardItem[];
  activeTab: DashboardTab;
  onDelete: (id: string, status: string) => void;
  onCancelBooking: (id: string) => void;
  onDonorCancelBooking: (id: string) => void;
  onEdit: (id: string) => void;
  deliveryState: DeliveryState;
  deliveryLoadingItemId: string | null;
  onRecipientConfirm: (itemId: string) => void;
  onDonorConfirm: (itemId: string) => void;
  onOpenChat?: (item: DashboardItem) => void;
  onReport?: (item: DashboardItem, target: "donor" | "receiver") => void;
  onAppeal?: (reportId: string) => void;
}

export type DashboardItemCardProps = Omit<ItemsTableProps, "items"> & {
  item: DashboardItem;
};

export function getBookedByName(bookedBy: DashboardItem["bookedBy"]): string {
  if (!bookedBy) return "";
  if (typeof bookedBy === "string") return bookedBy;
  return bookedBy.name ?? "";
}

export function hasBookedBy(
  bookedBy: BookedByUser | string | null | undefined
): boolean {
  if (!bookedBy) return false;
  if (typeof bookedBy === "string") return bookedBy.length > 0;
  return Boolean(bookedBy._id);
}
