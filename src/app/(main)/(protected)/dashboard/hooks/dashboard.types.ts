import type { MyItemsResponse } from "@/types/item.types";

export interface DashboardData {
  user: MyItemsResponse["user"];
  myDonations: MyItemsResponse["myDonations"];
  myRequests: MyItemsResponse["myRequests"];
}

export interface ConfirmModalState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
}

export interface AppealModalState {
  open: boolean;
  reportId: string;
}

export interface DeliveryState {
  itemId: string | null;
  waitingForDonor: boolean;
}

export type DashboardToastType = "success" | "error";
