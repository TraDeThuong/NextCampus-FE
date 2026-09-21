export type MaintenanceStatus = "ONLINE" | "MAINTENANCE" | "READ_ONLY";

export interface MaintenanceConfig {
  id: string;
  key: string;
  enabled: boolean;
  status: MaintenanceStatus;
  title: string;
  message: string;
  startAt: string | null;
  estimatedEndAt: string | null;
  bypassPermissions: string[];
  bypassRoles: string[];
  bypassIps: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceStatusResponse {
  success: boolean;
  data: MaintenanceConfig;
}

export interface EnableMaintenancePayload {
  title?: string;
  message?: string;
  startAt?: string | null;
  estimatedEndAt?: string | null;
  bypassPermissions?: string[];
  bypassRoles?: string[];
  bypassIps?: string[];
  status?: "MAINTENANCE" | "READ_ONLY";
}

export interface UpdateMaintenancePayload {
  enabled?: boolean;
  status?: MaintenanceStatus;
  title?: string;
  message?: string;
  startAt?: string | null;
  estimatedEndAt?: string | null;
  bypassPermissions?: string[];
  bypassRoles?: string[];
  bypassIps?: string[];
}

export interface MaintenanceActionResponse {
  success: boolean;
  message: string;
  data: MaintenanceConfig;
}
