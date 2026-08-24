import axiosInstance from "@/lib/api/axiosInstance";
import type {
  AdminBanUserPayload,
  AdminItemsResponse,
  AdminLogsResponse,
  AdminStats,
  AdminUserActionPayload,
  AdminUserMutationResponse,
  AdminUsersResponse,
} from "@/types/admin.types";

export async function getAdminStats(signal?: AbortSignal): Promise<AdminStats> {
  const { data } = await axiosInstance.get<AdminStats>("/api/admin/stats", { signal });
  return data;
}

export async function getAdminUsers({
  page = 1,
  search = "",
  banned,
}: {
  page?: number;
  search?: string;
  banned?: boolean;
} = {}, signal?: AbortSignal): Promise<AdminUsersResponse> {
  const { data } = await axiosInstance.get<AdminUsersResponse>(
    "/api/admin/users",
    {
      params: { page, search, ...(banned === undefined ? {} : { banned }) },
      signal,
    }
  );
  return data;
}

export async function banUser(
  userId: string,
  payload: AdminBanUserPayload
): Promise<AdminUserMutationResponse> {
  const { data } = await axiosInstance.post<AdminUserMutationResponse>(
    `/api/admin/users/${userId}/ban`,
    payload
  );
  return data;
}

export async function unbanUser(
  userId: string,
  payload: Pick<AdminUserActionPayload, "adminNote"> = {}
): Promise<AdminUserMutationResponse> {
  const { data } = await axiosInstance.post<AdminUserMutationResponse>(
    `/api/admin/users/${userId}/unban`,
    payload
  );
  return data;
}

export async function promoteUser(
  userId: string,
  payload: AdminUserActionPayload = {}
): Promise<AdminUserMutationResponse> {
  const { data } = await axiosInstance.post<AdminUserMutationResponse>(
    `/api/admin/users/${userId}/promote`,
    payload
  );
  return data;
}

export async function demoteUser(
  userId: string,
  payload: AdminUserActionPayload = {}
): Promise<AdminUserMutationResponse> {
  const { data } = await axiosInstance.post<AdminUserMutationResponse>(
    `/api/admin/users/${userId}/demote`,
    payload
  );
  return data;
}

export async function getAdminItems(
  page = 1,
  signal?: AbortSignal
): Promise<AdminItemsResponse> {
  const { data } = await axiosInstance.get<AdminItemsResponse>(
    "/api/admin/items",
    { params: { page }, signal }
  );
  return data;
}

interface AdminTableResponse {
  pages?: number;
  users?: unknown[];
  items?: unknown[];
  hubs?: unknown[];
  reports?: unknown[];
}

export async function getAdminTableRows<T>(
  endpoint: string,
  params: Record<string, unknown>,
  signal?: AbortSignal
): Promise<{ rows: T[]; pages: number }> {
  const { data } = await axiosInstance.get<AdminTableResponse | unknown[]>(endpoint, {
    params,
    signal,
  });

  if (Array.isArray(data)) return { rows: data as T[], pages: 1 };

  return {
    rows: (data.users ?? data.items ?? data.hubs ?? data.reports ?? []) as T[],
    pages: data.pages ?? 1,
  };
}

export async function deleteAdminItem(
  itemId: string,
  adminNote: string
): Promise<{ msg: string }> {
  const { data } = await axiosInstance.delete<{ msg: string }>(
    `/api/admin/items/${itemId}`,
    { data: { adminNote } }
  );
  return data;
}

export async function getAdminLogs(
  page = 1,
  signal?: AbortSignal
): Promise<AdminLogsResponse> {
  const { data } = await axiosInstance.get<AdminLogsResponse>(
    "/api/admin/logs",
    { params: { page }, signal }
  );
  return data;
}
