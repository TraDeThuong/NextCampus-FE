export type DiscordWebhookScope = "GLOBAL" | "DEPARTMENT" | "TASK_GROUP";

export type DiscordWebhookPurpose =
  | "DAILY_STANDUP"
  | "TASK_BOARD"
  | "MEETING_ROOM"
  | "LEADERBOARD"
  | "LEADER_ALERTS";

export type DiscordPingStatus = "SUCCESS" | "FAILED";

export interface DiscordWebhookItem {
  id: string;
  scope: DiscordWebhookScope;
  departmentId: string | null;
  departmentName?: string | null;
  taskGroupId: string | null;
  taskGroupName?: string | null;
  purpose: DiscordWebhookPurpose;
  webhookUrl: string; // Đã được che giấu token (masked)
  maskedWebhookUrl?: string;
  discordRoleId: string | null;
  threadId: string | null;
  isEnabled: boolean;
  lastPingAt: string | null;
  lastStatus: DiscordPingStatus | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DiscordWebhookConfig = DiscordWebhookItem;

export interface CreateDiscordWebhookPayload {
  scope?: DiscordWebhookScope;
  departmentId?: string | null;
  taskGroupId?: string | null;
  purpose: DiscordWebhookPurpose;
  webhookUrl: string;
  discordRoleId?: string | null;
  threadId?: string | null;
  isEnabled?: boolean;
}

export interface UpdateDiscordWebhookPayload {
  scope?: DiscordWebhookScope;
  departmentId?: string | null;
  taskGroupId?: string | null;
  purpose?: DiscordWebhookPurpose;
  webhookUrl?: string;
  discordRoleId?: string | null;
  threadId?: string | null;
  isEnabled?: boolean;
}

export interface DiscordBotStatus {
  isConnected: boolean;
  botId?: string;
  botName?: string;
  discriminator?: string;
  guildId?: string;
  guildName?: string;
  channelCount?: number;
  roleCount?: number;
  latencyMs?: number;
  error?: string;
}

export interface DiscordBotStatusResponse {
  success: boolean;
  data: DiscordBotStatus;
}

export interface ProvisionDepartmentResponse {
  success: boolean;
  message: string;
  data: {
    departmentId: string;
    departmentName: string;
    discordRoleId: string;
    roleName: string;
    threadId: string;
    threadName: string;
    parentChannelId: string;
    isNewlyCreated: boolean;
  };
}

export interface TestDiscordWebhookPayload {
  id?: string;
  webhookUrl?: string;
  discordRoleId?: string | null;
  channelName?: string;
}

export interface TestDiscordWebhookResponse {
  success: boolean;
  message: string;
  data?: {
    lastPingAt: string;
    statusCode?: number;
    responseTimeMs?: number;
  };
}

export interface DiscordWebhookListResponse {
  success: boolean;
  data: DiscordWebhookItem[];
}

export interface ProvisionAllDepartmentsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    succeeded: number;
    failed: number;
    results: Array<{
      departmentId: string;
      departmentName: string;
      success: boolean;
      discordRoleId?: string;
      threadId?: string;
      error?: string;
    }>;
  };
}
