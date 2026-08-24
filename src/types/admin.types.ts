import type { TrustLevel, UserRole } from "./user.types";

export interface AdminStats {
  totalUsers:     number;
  bannedUsers:    number;
  totalItems:     number;
  deliveredItems: number;
  pendingReports: number;
}

export interface AdminUser {
  _id:               string;
  name:              string;
  email:             string;
  phone:             string | null;
  avatar:            string;
  role:              UserRole;
  trustLevel:        TrustLevel;
  trustScore:        number;
  quota:             number;
  totalDonations:    number;
  isVerified:        boolean;
  isVerifiedStudent: boolean;
  phoneVerified:     boolean;
  isBanned:          boolean;
  isFrozen:          boolean;
  banReason:         string | null;
  createdAt:         string | null;
  updatedAt:         string | null;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page:  number;
  pages: number;
}

export interface AdminUserMutationResponse {
  msg:  string;
  user: AdminUser;
}

export interface AdminUserActionPayload {
  reason?:    string;
  adminNote?: string;
}

export interface AdminBanUserPayload {
  reason:     string;
  adminNote?: string;
}

export interface AdminItem {
  _id:       string;
  title:     string;
  category:  string;
  status:    string;
  imageUrl:  string | null;
  donor: {
    _id:   string;
    name:  string | null;
    email: string | null;
  } | null;
  createdAt: string | null;
}

export interface AdminItemsResponse {
  items: AdminItem[];
  total: number;
  page:  number;
  pages: number;
}

export interface AdminPersonReference {
  _id:   string;
  name:  string | null;
  email: string | null;
  title: string | null;
}

export type AdminTargetReference = AdminPersonReference | string | null;

export interface AdminAuditMeta {
  targetName?:       string;
  targetEmail?:      string;
  itemTitle?:        string;
  reason?:           string;
  reportedBy?:       string;
  action?:           string;
  changedFields?:    string[];
  [key: string]: unknown;
}

export interface AdminAuditLog {
  _id:         string;
  adminId:     AdminTargetReference;
  action:      string;
  targetId:    AdminTargetReference;
  targetModel: string | null;
  targetName:  string | null;
  details:     string | null;
  reason:      string | null;
  adminNote:   string | null;
  meta:        AdminAuditMeta;
  createdAt:   string | null;
}

export interface AdminLogsResponse {
  logs:  AdminAuditLog[];
  total: number;
  page:  number;
  pages: number;
}
